import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

import { ok, fail } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      items: { select: { id: true } },
    },
  });

  return ok(res, orders);
}