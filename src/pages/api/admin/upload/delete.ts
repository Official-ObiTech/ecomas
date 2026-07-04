import type { NextApiRequest, NextApiResponse } from "next";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const publicId = req.body?.publicId as string | undefined;
  if (!publicId) return fail(res, "publicId is required");

  await cloudinary.uploader.destroy(publicId).catch(() => null);
  return ok(res, { publicId }, "Image deleted");
}