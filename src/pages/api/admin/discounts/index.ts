import type { NextApiRequest, NextApiResponse } from "next";
import { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
    return ok(res, discounts);
  }

  if (req.method === "POST") {
    const b = req.body ?? {};
    if (!b.code?.trim()) return fail(res, "Code is required");
    if (b.type !== "PERCENTAGE" && b.type !== "FIXED") return fail(res, "Invalid discount type");
    if (b.value == null || Number(b.value) <= 0) return fail(res, "Value must be greater than 0");
    if (b.type === "PERCENTAGE" && Number(b.value) > 100) return fail(res, "Percentage can't exceed 100");

    const code = String(b.code).trim().toUpperCase();
    const exists = await prisma.discount.findUnique({ where: { code } });
    if (exists) return fail(res, "A discount with this code already exists", 409);

    const discount = await prisma.discount.create({
      data: {
        code,
        type: b.type as DiscountType,
        value: Math.round(Number(b.value)), // percent, or kobo for FIXED
        active: b.active ?? true,
        maxUses: b.maxUses ? parseInt(String(b.maxUses), 10) : null,
        minOrderAmount: b.minOrderAmount ? Math.round(Number(b.minOrderAmount)) : null, // kobo
        startsAt: b.startsAt ? new Date(b.startsAt) : null,
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
      },
    });
    return ok(res, discount, "Discount created", 201);
  }

  return fail(res, "Method not allowed", 405);
}