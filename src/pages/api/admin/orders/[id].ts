import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const id = String(req.query.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, discount: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!order) return fail(res, "Order not found", 404);
  return ok(res, order);
}