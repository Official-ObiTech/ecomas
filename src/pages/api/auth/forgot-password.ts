import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

import { sendEmail } from "@/lib/email/send";
import { otpEmail } from "@/lib/email/templates";
import { generateOtp, storeOtp } from "@/lib/auth/otp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (user?.password) { // only for credential accounts
    const code = generateOtp();
    await storeOtp(user.email, code);
    const mail = otpEmail(code);
    await sendEmail({ to: user.email, subject: `${mail.subject} (password reset)`, html: mail.html });
  }
  // always ok — don't reveal account existence
  return res.status(200).json({ success: true, message: "If the account exists, a reset code was sent" });
}