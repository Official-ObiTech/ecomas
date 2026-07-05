import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const id = String(req.query.id);

  if (req.method === "PATCH") {
    const b = req.body ?? {};
    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) return fail(res, "Discount not found", 404);

    const data: Prisma.DiscountUpdateInput = {};
    if (b.code !== undefined) {
      const code = String(b.code).trim().toUpperCase();
      if (code !== existing.code) {
        const dupe = await prisma.discount.findUnique({ where: { code } });
        if (dupe) return fail(res, "A discount with this code already exists", 409);
      }
      data.code = code;
    }
    if (b.type !== undefined) data.type = b.type;
    if (b.value !== undefined) data.value = Math.round(Number(b.value));
    if (b.active !== undefined) data.active = !!b.active;
    if (b.maxUses !== undefined) data.maxUses = b.maxUses ? parseInt(String(b.maxUses), 10) : null;
    if (b.minOrderAmount !== undefined) data.minOrderAmount = b.minOrderAmount ? Math.round(Number(b.minOrderAmount)) : null;
    if (b.startsAt !== undefined) data.startsAt = b.startsAt ? new Date(b.startsAt) : null;
    if (b.expiresAt !== undefined) data.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;

    const discount = await prisma.discount.update({ where: { id }, data });
    return ok(res, discount, "Discount updated");
  }

  if (req.method === "DELETE") {
    await prisma.discount.delete({ where: { id } }).catch(() => null);
    return ok(res, { id }, "Discount deleted");
  }

  return fail(res, "Method not allowed", 405);
}