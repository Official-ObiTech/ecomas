import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";
import { Prisma } from "@/generated/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const { status, q, page = "1", limit = "20" } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const skip = (pageNum - 1) * take;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = String(status) as Prisma.OrderWhereInput["status"];
  if (q) {
    where.OR = [
      { orderNumber: { contains: String(q), mode: "insensitive" } },
      { email: { contains: String(q), mode: "insensitive" } },
      { shippingName: { contains: String(q), mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return ok(res, {
    items,
    pagination: { page: pageNum, limit: take, total, pages: Math.ceil(total / take) },
  });
}