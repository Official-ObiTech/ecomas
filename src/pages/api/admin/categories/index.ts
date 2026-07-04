import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";
import { slugify } from "@/lib/slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true } } },
    });
    return ok(res, categories);
  }

  if (req.method === "POST") {
    const b = req.body ?? {};
    if (!b.name) return fail(res, "Name is required");
    const slug = slugify(b.slug || b.name);
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return fail(res, "A category with this slug already exists", 409);

    const category = await prisma.category.create({
      data: { name: b.name, slug, description: b.description ?? null, image: b.image ?? null },
    });
    return ok(res, category, "Category created", 201);
  }

  return fail(res, "Method not allowed", 405);
}