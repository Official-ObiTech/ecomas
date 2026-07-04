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

  if (req.method === "PATCH") {
    const b = req.body ?? {};
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) return fail(res, "Collection not found", 404);

    const data: Prisma.CollectionUpdateInput = {};
    if (b.name !== undefined) data.name = b.name;
    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.description !== undefined) data.description = b.description;
    if (b.image !== undefined) data.image = b.image;
    if (Array.isArray(b.productIds))
      data.products = { set: b.productIds.map((pid: string) => ({ id: pid })) };

    if (typeof data.slug === "string" && data.slug !== existing.slug) {
      const dupe = await prisma.collection.findUnique({ where: { slug: data.slug } });
      if (dupe) return fail(res, "A collection with this slug already exists", 409);
    }

    const collection = await prisma.collection.update({ where: { id }, data });
    return ok(res, collection, "Collection updated");
  }

  if (req.method === "DELETE") {
    await prisma.collection.delete({ where: { id } }).catch(() => null);
    return ok(res, { id }, "Collection deleted");
  }

  return fail(res, "Method not allowed", 405);
}