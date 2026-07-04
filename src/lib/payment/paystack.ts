const BASE = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY as string;

function authHeaders() {
  return {
    Authorization: `Bearer ${SECRET}`,
    "Content-Type": "application/json",
  };
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // kobo
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Failed to initialize payment");
  return json.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Failed to verify payment");
  return json.data as {
    status: string; // "success" | "failed" | "abandoned"
    amount: number; // kobo
    channel: string;
    paid_at: string | null;
    reference: string;
    metadata: Record<string, unknown>;
  };
}