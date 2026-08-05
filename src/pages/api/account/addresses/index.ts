import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

import { ok, fail } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, addresses);
  }

  if (req.method === "POST") {
    const b = req.body ?? {};
    if (!b.fullName || !b.line1 || !b.city || !b.state) return fail(res, "Please complete the address");

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: b.fullName,
        phone: b.phone ?? "",
        line1: b.line1,
        line2: b.line2 ?? null,
        city: b.city,
        state: b.state,
        country: b.country ?? "Nigeria",
        isDefault: !!b.isDefault,
      },
    });
    return ok(res, address, "Address added", 201);
  }

  return fail(res, "Method not allowed", 405);
}