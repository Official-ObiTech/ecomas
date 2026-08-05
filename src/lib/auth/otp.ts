import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtp(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashOtp(email: string, code: string): string {
  return crypto.createHash("sha256").update(`${email.toLowerCase()}:${code}`).digest("hex");
}

export async function storeOtp(email: string, code: string) {
  const identifier = email.toLowerCase();
  // clear any previous codes for this email
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashOtp(identifier, code),
      expires: new Date(Date.now() + OTP_TTL_MS),
    },
  });
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const identifier = email.toLowerCase();
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashOtp(identifier, code) },
  });
  if (!record || record.identifier !== identifier) return false;
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return false;
  }
  // one-time use
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return true;
}