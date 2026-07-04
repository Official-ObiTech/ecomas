
import { PaymentStatus, Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { sendOrderPaidEmails } from "@/lib/email/orderEmails";


type VerifiedPayment = {
  status: string;
  amount: number; // kobo
  channel?: string;
  paid_at?: string | null;
  raw?: unknown;
};

/**
 * Marks an order PAID exactly once. Safe to call from the webhook AND the
 * browser verify redirect — whichever lands first wins, the other no-ops.
 */
export async function fulfillOrder(reference: string, verified: VerifiedPayment) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: { include: { items: true } } },
  });

  if (!payment) return { ok: false, reason: "payment_not_found" as const };
  const order = payment.order;

  // Only a successful Paystack charge with a matching amount may fulfill.
  if (verified.status !== "success") {
    await prisma.payment.update({
      where: { reference },
      data: { status: PaymentStatus.FAILED, raw: verified.raw as Prisma.InputJsonValue },
    });
    return { ok: false, reason: "not_successful" as const };
  }
  if (verified.amount !== order.total) {
    return { ok: false, reason: "amount_mismatch" as const };
  }

  const result = await prisma.$transaction(async (tx) => {
    // Atomic claim: only the caller that flips PENDING -> PAID does the rest.
    const claim = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: { status: "PAID" },
    });

    if (claim.count === 0) {
      return { alreadyFulfilled: true };
    }

    await tx.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.SUCCESS,
        channel: verified.channel ?? null,
        paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
        raw: verified.raw as Prisma.InputJsonValue,
      },
    });

    // decrement stock (skip items whose product was later deleted)
    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (order.discountId) {
      await tx.discount.update({
        where: { id: order.discountId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return { alreadyFulfilled: false };
  });

   // Fire emails only when THIS call did the fulfilling, after the tx commits.
  if (!result.alreadyFulfilled) {
    await sendOrderPaidEmails(order.id).catch((e) =>
      console.error("Order email dispatch failed:", e)
    );
  }


  return { ok: true, ...result };
}