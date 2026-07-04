import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = String(email).toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const hashed = await bcrypt.hash(String(password), 10);

  const user = await prisma.user.create({
    data: { name: name ?? null, email: normalizedEmail, password: hashed },
    select: { id: true, name: true, email: true, role: true },
  });

  return res.status(201).json({ success: true, message: "Account created", data: user });
}