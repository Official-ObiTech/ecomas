import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";

import { siteConfig } from "@/config/site";
import { initializeTransaction } from "@/lib/payment/paystack";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const orderNumber = req.body?.orderNumber as string | undefined;
  if (!orderNumber) return fail(res, "orderNumber is required");

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) return fail(res, "Order not found", 404);
  if (order.status !== "PENDING") return fail(res, "This order is not awaiting payment", 409);

  // ownership check for logged-in orders (guest orders identified by orderNumber)
  if (order.userId) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.id !== order.userId) return fail(res, "Forbidden", 403);
  }

  // fresh reference each attempt; keep one Payment row per order (unique orderId)
  const reference = `${order.orderNumber}-${Date.now().toString(36)}`.toUpperCase();

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { reference, amount: order.total, status: "PENDING" },
    create: { orderId: order.id, reference, amount: order.total, status: "PENDING" },
  });

  const data = await initializeTransaction({
    email: order.email,
    amount: order.total, // kobo
    reference,
    callbackUrl: `${siteConfig.url}/checkout/verify`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  return ok(res, { authorizationUrl: data.authorization_url, reference });
}