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
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return fail(res, "Category not found", 404);

    const data: Prisma.CategoryUpdateInput = {};
    if (b.name !== undefined) data.name = b.name;
    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.description !== undefined) data.description = b.description;
    if (b.image !== undefined) data.image = b.image;

    if (typeof data.slug === "string" && data.slug !== existing.slug) {
      const dupe = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (dupe) return fail(res, "A category with this slug already exists", 409);
    }

    const category = await prisma.category.update({ where: { id }, data });
    return ok(res, category, "Category updated");
  }

  if (req.method === "DELETE") {
    await prisma.category.delete({ where: { id } }).catch(() => null);
    return ok(res, { id }, "Category deleted");
  }

  return fail(res, "Method not allowed", 405);
}