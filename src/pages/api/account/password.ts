import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

import { ok, fail } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) return fail(res, "All fields are required");
  if (String(newPassword).length < 8) return fail(res, "New password must be at least 8 characters");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return fail(res, "Password change unavailable for this account", 400);

  const valid = await bcrypt.compare(String(currentPassword), user.password);
  if (!valid) return fail(res, "Current password is incorrect", 400);

  const hashed = await bcrypt.hash(String(newPassword), 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return ok(res, { id: user.id }, "Password updated");
}