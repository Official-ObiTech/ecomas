import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);
  const slug = String(req.query.slug);
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!category) return fail(res, "Category not found", 404);
  return ok(res, category);
}