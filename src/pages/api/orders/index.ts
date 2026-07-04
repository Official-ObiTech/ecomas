import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";
import { computeDiscount } from "@/lib/order/discount";
import { generateOrderNumber } from "@/lib/order/orderNumber";


const SHIPPING_FLAT = 0; // kobo — swap for a real rule later

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    if (!session) return fail(res, "Unauthorized", 401);
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, orders);
  }

  if (req.method === "POST") {
    const b = req.body ?? {};
    const items = Array.isArray(b.items) ? b.items : [];
    if (!items.length) return fail(res, "Cart is empty");
    if (!b.email || !b.phone) return fail(res, "Email and phone are required");
    if (!b.shipping?.fullName || !b.shipping?.line1 || !b.shipping?.city || !b.shipping?.state) {
      return fail(res, "Complete shipping details are required");
    }

    // load real products, ignore any client-sent prices
    const ids: string[] = items.map((i: any) => String(i.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, status: "ACTIVE" },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: {
      productId: string;
      name: string;
      price: number;
      image: string | null;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const raw of items) {
      const product = byId.get(String(raw.productId));
      if (!product) return fail(res, "One or more products are unavailable", 409);

      const qty = Math.max(1, parseInt(String(raw.quantity), 10) || 1);
      if (product.stock < qty) return fail(res, `${product.name} is out of stock`, 409);

      const line = product.price * qty;
      subtotal += line;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
        quantity: qty,
        subtotal: line,
      });
    }

    // discount (optional)
    let discountId: string | null = null;
    let discountAmount = 0;
    if (b.discountCode) {
      const result = await computeDiscount(String(b.discountCode), subtotal);
      if ("error" in result) return fail(res, result.error);
      discountId = result.discountId;
      discountAmount = result.amount;
    }

    const shippingAmount = SHIPPING_FLAT;
    const total = subtotal - discountAmount + shippingAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        userId: session?.user.id ?? null,
        email: String(b.email).toLowerCase(),
        phone: String(b.phone),
        shippingName: b.shipping.fullName,
        shippingPhone: b.shipping.phone ?? b.phone,
        shippingLine1: b.shipping.line1,
        shippingLine2: b.shipping.line2 ?? null,
        shippingCity: b.shipping.city,
        shippingState: b.shipping.state,
        shippingCountry: b.shipping.country ?? "Nigeria",
        subtotal,
        discountAmount,
        shippingAmount,
        total,
        discountId,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return ok(res, order, "Order created", 201);
  }

  return fail(res, "Method not allowed", 405);
}