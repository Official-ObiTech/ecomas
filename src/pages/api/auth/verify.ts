import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/auth/otp";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { email, code } = req.body ?? {};
  if (!email || !code) return res.status(400).json({ success: false, message: "Email and code are required" });

  const ok = await verifyOtp(String(email), String(code));
  if (!ok) return res.status(400).json({ success: false, message: "Invalid or expired code" });

  await prisma.user.update({
    where: { email: String(email).toLowerCase() },
    data: { emailVerified: new Date() },
  });

  return res.status(200).json({ success: true, message: "Email verified" });
}