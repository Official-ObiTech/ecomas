import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle, XCircle, Spinner, Package, ArrowRight } from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";
import { fetchClient } from "@/lib/fetchClient";

import { useCartStore } from "@/stores/cartStore";
import { formatNaira } from "@/lib/payment/money";

type Status = "verifying" | "success" | "pending" | "failed";

interface VerifyResult {
  data: {
    paymentStatus: "SUCCESS" | "PENDING" | "FAILED";
    order: { orderNumber: string; status: string; total: number } | null;
  };
}

export default function VerifyPage() {
  const router = useRouter();
  const reference = router.query.reference as string | undefined;
  const clearCart = useCartStore((s) => s.clear);

  const [status, setStatus] = useState<Status>("verifying");
  const [order, setOrder] = useState<VerifyResult["data"]["order"]>(null);
  const ran = useRef(false); // guard against double-run (router hydration / StrictMode)

  useEffect(() => {
    if (!reference || ran.current) return;
    ran.current = true;

    fetchClient<VerifyResult>(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => {
        const { paymentStatus, order } = res.data;
        setOrder(order);
        if (paymentStatus === "SUCCESS") {
          setStatus("success");
          clearCart(); // only clear once the order is truly PAID
        } else if (paymentStatus === "FAILED") {
          setStatus("failed");
        } else {
          setStatus("pending"); // webhook may still be in flight
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference, clearCart]);

  return (
    <Layout>
      <Seo title="Payment" noIndex />
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        {status === "verifying" && (
          <>
            <Spinner size={56} className="mb-6 animate-spin text-ink/40" />
            <h1 className="mb-2 font-serif text-2xl text-ink">Confirming your payment…</h1>
            <p className="text-sm text-ink/50">Please don't close this window.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={56} weight="fill" className="text-green-600" />
            </div>
            <h1 className="mb-3 font-serif text-3xl text-ink">Order confirmed 🎉</h1>
            <p className="mb-1 text-ink/60">Thank you for your order.</p>
            {order && (
              <p className="mb-8 text-sm text-ink/50">
                Order <span className="font-medium text-ink">{order.orderNumber}</span> · {formatNaira(order.total)}
              </p>
            )}
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              {order && (
                <Link href={`/account/orders/${order.orderNumber}`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-white hover:bg-ink-light">
                  <Package size={16} /> Track My Order
                </Link>
              )}
              <Link href="/products" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 py-3.5 text-sm text-ink hover:bg-cream">
                Continue Shopping <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <Spinner size={56} className="mb-6 text-amber-500" />
            <h1 className="mb-3 font-serif text-2xl text-ink">Payment processing</h1>
            <p className="mb-8 max-w-sm text-sm text-ink/50">
              Your payment is being confirmed. This can take a moment — we'll update your order automatically once it clears.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              {order && (
                <Link href={`/account/orders/${order.orderNumber}`} className="flex-1 rounded-full bg-ink py-3.5 text-center text-sm font-medium text-white hover:bg-ink-light">
                  View Order
                </Link>
              )}
              <Link href="/" className="flex-1 rounded-full border border-ink/15 py-3.5 text-center text-sm text-ink hover:bg-cream">
                Back Home
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <XCircle size={56} weight="fill" className="text-red-600" />
            </div>
            <h1 className="mb-3 font-serif text-2xl text-ink">Payment not completed</h1>
            <p className="mb-8 max-w-sm text-sm text-ink/50">
              Your payment didn't go through. Your cart is still saved — you can try again.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="flex-1 rounded-full bg-ink py-3.5 text-center text-sm font-medium text-white hover:bg-ink-light">
                Try Again
              </Link>
              <Link href="/products" className="flex-1 rounded-full border border-ink/15 py-3.5 text-center text-sm text-ink hover:bg-cream">
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}