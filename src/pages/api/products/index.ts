import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";
import { Prisma } from "@/generated/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const { category, collection, featured, q, page = "1", limit = "12" } = req.query;

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const take = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
  const skip = (pageNum - 1) * take;

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (category) where.category = { slug: String(category) };
  if (collection) where.collections = { some: { slug: String(collection) } };
  if (featured === "true") where.featured = true;
  if (q) where.name = { contains: String(q), mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return ok(res, {
    items,
    pagination: { page: pageNum, limit: take, total, pages: Math.ceil(total / take) },
  });
}