import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";
import { canTransition } from "@/lib/order/orderState";
import { OrderStatus } from "@/generated/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "PATCH") return fail(res, "Method not allowed", 405);

  const id = String(req.query.id);
  const next = req.body?.status as OrderStatus | undefined;

  if (!next || !(next in OrderStatus)) return fail(res, "A valid status is required");

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return fail(res, "Order not found", 404);

  if (order.status === next) return fail(res, `Order is already ${next}`);

  if (!canTransition(order.status, next)) {
    return fail(res, `Cannot move an order from ${order.status} to ${next}`, 422);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: next },
    include: { items: true, payment: true },
  });

  return ok(res, updated, `Order marked ${next}`);
}