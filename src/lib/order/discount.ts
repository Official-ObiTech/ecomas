import { prisma } from "@/lib/prisma";

export async function computeDiscount(
  code: string,
  subtotal: number
): Promise<{ discountId: string; amount: number } | { error: string }> {
  const discount = await prisma.discount.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!discount || !discount.active) return { error: "Invalid discount code" };

  const now = new Date();
  if (discount.startsAt && now < discount.startsAt) return { error: "Discount not yet active" };
  if (discount.expiresAt && now > discount.expiresAt) return { error: "Discount has expired" };
  if (discount.maxUses != null && discount.usedCount >= discount.maxUses)
    return { error: "Discount usage limit reached" };
  if (discount.minOrderAmount != null && subtotal < discount.minOrderAmount)
    return { error: "Order does not meet the minimum for this discount" };

  const amount =
    discount.type === "PERCENTAGE"
      ? Math.round((subtotal * discount.value) / 100)
      : discount.value;

  return { discountId: discount.id, amount: Math.min(amount, subtotal) };
}