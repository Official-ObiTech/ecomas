import { fetchClient } from "@/lib/fetchClient";

type InitResponse = { data: { authorizationUrl: string; reference: string } };

export async function startPayment(orderNumber: string) {
  const { data } = await fetchClient<InitResponse>("/api/payments/initialize", {
    method: "POST",
    body: { orderNumber },
  });
  // redirect to Paystack's hosted checkout
  window.location.href = data.authorizationUrl;
}