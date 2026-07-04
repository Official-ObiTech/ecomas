import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";
import { fulfillOrder } from "@/lib/payment/fulfillOrder";
import { verifyTransaction } from "@/lib/payment/paystack";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const reference = String(req.query.reference || "");
  if (!reference) return fail(res, "reference is required");

  const verified = await verifyTransaction(reference);
  await fulfillOrder(reference, { ...verified, raw: verified });

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: { select: { orderNumber: true, status: true, total: true } } },
  });

  if (!payment) return fail(res, "Payment not found", 404);

  return ok(res, {
    paymentStatus: payment.status,
    order: payment.order,
  });
}