import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

import { sendEmail } from "@/lib/email/send";
import { otpEmail } from "@/lib/email/templates";
import { generateOtp, storeOtp } from "@/lib/auth/otp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { name, email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
  if (String(password).length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

  const normalizedEmail = String(email).toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // block only if a VERIFIED account already exists
  if (existing?.emailVerified) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const hashed = await bcrypt.hash(String(password), 10);

  if (existing) {
    // unverified account re-registering — update credentials, resend code
    await prisma.user.update({
      where: { id: existing.id },
      data: { name: name ?? existing.name, password: hashed },
    });
  } else {
    await prisma.user.create({
      data: { name: name ?? null, email: normalizedEmail, password: hashed }, // emailVerified stays null
    });
  }

  const code = generateOtp();
  await storeOtp(normalizedEmail, code);
  const mail = otpEmail(code);
  await sendEmail({ to: normalizedEmail, subject: mail.subject, html: mail.html });

  return res.status(201).json({ success: true, message: "Verification code sent", data: { email: normalizedEmail } });
}