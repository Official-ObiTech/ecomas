import type { NextApiRequest, NextApiResponse } from "next";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/apiAuth";
import { ok, fail } from "@/lib/apiResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const folder = (req.body?.folder as string) || "ecomas/products";
  const timestamp = Math.round(Date.now() / 1000);

  // sign exactly the params the client will send (alphabetical) — nothing more
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return ok(res, {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}