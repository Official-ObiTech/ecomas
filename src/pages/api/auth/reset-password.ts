import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/auth/otp";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });
  const { email, code, password } = req.body ?? {};
  if (!email || !code || !password) return res.status(400).json({ success: false, message: "All fields are required" });
  if (String(password).length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

  const ok = await verifyOtp(String(email), String(code));
  if (!ok) return res.status(400).json({ success: false, message: "Invalid or expired code" });

  const hashed = await bcrypt.hash(String(password), 10);
  await prisma.user.update({
    where: { email: String(email).toLowerCase() },
    data: { password: hashed, emailVerified: new Date() }, // reset also verifies
  });
  return res.status(200).json({ success: true, message: "Password reset" });
}