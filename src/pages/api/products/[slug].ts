import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const slug = String(req.query.slug);
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: { category: true, collections: true },
  });

  if (!product) return fail(res, "Product not found", 404);
  return ok(res, product);
}