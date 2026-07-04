import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";
import { slugify } from "@/lib/slugify";
import { Prisma } from "@/generated/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const id = String(req.query.id);

  if (req.method === "GET") {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, collections: true },
    });
    if (!product) return fail(res, "Product not found", 404);
    return ok(res, product);
  }

  if (req.method === "PATCH") {
    const b = req.body ?? {};
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return fail(res, "Product not found", 404);

    const data: Prisma.ProductUpdateInput = {};
    if (b.name !== undefined) data.name = b.name;
    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.description !== undefined) data.description = b.description;
    if (b.price !== undefined) data.price = Math.round(Number(b.price));
    if (b.compareAtPrice !== undefined)
      data.compareAtPrice = b.compareAtPrice == null ? null : Math.round(Number(b.compareAtPrice));
    if (b.stock !== undefined) data.stock = parseInt(String(b.stock), 10);
    if (b.sku !== undefined) data.sku = b.sku;
    if (b.images !== undefined) data.images = Array.isArray(b.images) ? b.images : [];
    if (b.status !== undefined) data.status = b.status;
    if (b.featured !== undefined) data.featured = !!b.featured;
    if (b.categoryId !== undefined)
      data.category = b.categoryId ? { connect: { id: b.categoryId } } : { disconnect: true };
    if (Array.isArray(b.collectionIds))
      data.collections = { set: b.collectionIds.map((cid: string) => ({ id: cid })) };

    if (typeof data.slug === "string" && data.slug !== existing.slug) {
      const dupe = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (dupe) return fail(res, "A product with this slug already exists", 409);
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true, collections: true },
    });
    return ok(res, product, "Product updated");
  }

  if (req.method === "DELETE") {
    await prisma.product.delete({ where: { id } }).catch(() => null);
    return ok(res, { id }, "Product deleted");
  }

  return fail(res, "Method not allowed", 405);
}