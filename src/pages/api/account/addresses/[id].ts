import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

import { ok, fail } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const id = String(req.query.id);
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) return fail(res, "Address not found", 404);

  if (req.method === "PATCH") {
    const b = req.body ?? {};
    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName: b.fullName ?? existing.fullName,
        phone: b.phone ?? existing.phone,
        line1: b.line1 ?? existing.line1,
        line2: b.line2 ?? existing.line2,
        city: b.city ?? existing.city,
        state: b.state ?? existing.state,
        country: b.country ?? existing.country,
      },
    });
    return ok(res, address, "Address updated");
  }

  if (req.method === "DELETE") {
    await prisma.address.delete({ where: { id } });
    return ok(res, { id }, "Address deleted");
  }

  return fail(res, "Method not allowed", 405);
}