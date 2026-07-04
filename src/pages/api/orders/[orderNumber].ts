import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const session = await getServerSession(req, res, authOptions);
  if (!session) return fail(res, "Unauthorized", 401);

  const orderNumber = String(req.query.orderNumber);
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, discount: true },
  });

  if (!order) return fail(res, "Order not found", 404);

  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return fail(res, "Forbidden", 403);

  return ok(res, order);
}