import type { NextApiResponse } from "next";

export function ok<T>(res: NextApiResponse, data: T, message?: string, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function fail(res: NextApiResponse, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}