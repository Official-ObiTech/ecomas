import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";
import { slugify } from "@/lib/slugify";
import { Prisma } from "@/generated/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const { q, status, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: Prisma.ProductWhereInput = {};
    if (status) where.status = String(status) as Prisma.ProductWhereInput["status"];
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

  if (req.method === "POST") {
    const b = req.body ?? {};
    if (!b.name) return fail(res, "Name is required");
    if (b.price == null || Number.isNaN(Number(b.price))) return fail(res, "Price is required");

    const slug = slugify(b.slug || b.name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) return fail(res, "A product with this slug already exists", 409);

    const product = await prisma.product.create({
      data: {
        name: b.name,
        slug,
        description: b.description ?? null,
        price: Math.round(Number(b.price)), // kobo
        compareAtPrice: b.compareAtPrice != null ? Math.round(Number(b.compareAtPrice)) : null,
        stock: b.stock != null ? parseInt(String(b.stock), 10) : 0,
        sku: b.sku ?? null,
        images: Array.isArray(b.images) ? b.images : [],
        status: b.status ?? "DRAFT",
        featured: !!b.featured,
        categoryId: b.categoryId ?? null,
        collections:
          Array.isArray(b.collectionIds) && b.collectionIds.length
            ? { connect: b.collectionIds.map((id: string) => ({ id })) }
            : undefined,
      },
      include: { category: true, collections: true },
    });

    return ok(res, product, "Product created", 201);
  }

  return fail(res, "Method not allowed", 405);
}