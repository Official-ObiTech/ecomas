import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return session;
}

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  if (session.user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Forbidden" });
    return null;
  }
  return session;
}