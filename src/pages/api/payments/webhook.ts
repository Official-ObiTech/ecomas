import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { fulfillOrder } from "@/lib/payment/fulfillOrder";


// Paystack signs the RAW body — disable Next's parser so we can hash it verbatim.
export const config = { api: { bodyParser: false } };

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const raw = await readRawBody(req);

  const signature = req.headers["x-paystack-signature"] as string | undefined;
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
    .update(raw)
    .digest("hex");

  if (!signature || signature !== expected) {
    return res.status(401).json({ status: false, message: "Invalid signature" });
  }

  const event = JSON.parse(raw.toString("utf8"));

  // Ack fast; only act on successful charges.
  if (event.event === "charge.success") {
    const data = event.data;
    await fulfillOrder(data.reference, {
      status: data.status,
      amount: data.amount,
      channel: data.channel,
      paid_at: data.paid_at,
      raw: data,
    }).catch((e) => console.error("Fulfillment error:", e));
  }

  // Always 200 so Paystack stops retrying a received event.
  return res.status(200).json({ received: true });
}