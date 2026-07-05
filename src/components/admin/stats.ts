import type { NextApiRequest, NextApiResponse } from "next";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await requireAdmin(req, res);
    if (!session) return;
    if (req.method !== "GET") return fail(res, "Method not allowed", 405);

    const paidStatuses: OrderStatus[] = [
        OrderStatus.PAID,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
    ];

    const [productCount, orderCount, customerCount, pendingCount, revenue, recentOrders] =
        await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: paidStatuses } } }),
            prisma.order.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, orderNumber: true, status: true, total: true, email: true, createdAt: true },
            }),
        ]);

    return ok(res, {
        productCount,
        orderCount,
        customerCount,
        pendingCount,
        revenue: revenue._sum?.total ?? 0, // kobo
        recentOrders,
    });
}