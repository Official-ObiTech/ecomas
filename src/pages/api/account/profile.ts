import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

import { ok, fail } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, image: true, role: true },
    });
    if (!user) return fail(res, "User not found", 404);
    return ok(res, user);
  }

  if (req.method === "PATCH") {
    const b = req.body ?? {};
    const data: { name?: string; phone?: string } = {};
    if (b.name !== undefined) data.name = String(b.name).trim();
    if (b.phone !== undefined) data.phone = String(b.phone).trim() || null as any;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, image: true, role: true },
    });
    return ok(res, user, "Profile updated");
  }

  return fail(res, "Method not allowed", 405);
}