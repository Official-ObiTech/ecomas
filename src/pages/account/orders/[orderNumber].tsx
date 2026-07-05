import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, CheckCircle, Truck, House, XCircle } from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";
import { fetchClient } from "@/lib/fetchClient";
import { formatNaira } from "@/lib/payment/money";


interface OrderItem { id: string; name: string; image: string | null; quantity: number; price: number; subtotal: number; }
interface Order {
  orderNumber: string;
  status: string;
  email: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  payment?: { status: string } | null;
}

// happy-path timeline; cancelled/refunded shown separately
const FLOW = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const stepMeta: Record<string, { label: string; icon: typeof Package }> = {
  PENDING: { label: "Order placed", icon: Package },
  PAID: { label: "Payment confirmed", icon: CheckCircle },
  PROCESSING: { label: "Preparing your order", icon: Package },
  SHIPPED: { label: "Shipped", icon: Truck },
  DELIVERED: { label: "Delivered", icon: House },
};

function unwrap<T>(res: unknown): T | null {
  const d = (res as { data?: unknown })?.data as { data?: unknown } | undefined;
  return ((d?.data ?? d) as T) ?? null;
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const orderNumber = router.query.orderNumber as string | undefined;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    fetchClient<unknown>(`/api/orders/${orderNumber}`)
      .then((res) => setOrder(unwrap<Order>(res)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading)
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="skeleton mb-6 h-8 w-48 rounded" />
          <div className="skeleton mb-4 h-40 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </Layout>
    );

  if (error || !order)
    return (
      <Layout>
        <Seo title="Order" noIndex />
        <div className="py-24 text-center">
          <h2 className="mb-4 font-serif text-xl text-ink">Order not found</h2>
          <Link href="/account/orders" className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">My Orders</Link>
        </div>
      </Layout>
    );

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const currentIndex = FLOW.indexOf(order.status);

  return (
    <Layout>
      <Seo title={`Order ${order.orderNumber}`} noIndex />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-[50px]">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/account/orders" className="text-ink/40 hover:text-ink" aria-label="Back"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="font-serif text-2xl text-ink">Order {order.orderNumber}</h1>
            <p className="mt-0.5 text-sm text-ink/50">
              Placed {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Timeline */}
        {isCancelled ? (
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 p-6">
            <XCircle size={28} weight="fill" className="text-red-500" />
            <div>
              <p className="font-medium text-ink">Order {order.status === "REFUNDED" ? "refunded" : "cancelled"}</p>
              <p className="text-sm text-ink/50">This order is no longer being processed.</p>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-ink/10 p-6">
            <div className="space-y-5">
              {FLOW.map((step, i) => {
                const meta = stepMeta[step];
                const Icon = meta.icon;
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? "bg-ink text-white" : "bg-ink/5 text-ink/30"}`}>
                      <Icon size={18} weight={done ? "fill" : "regular"} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${active ? "text-ink" : done ? "text-ink/70" : "text-ink/40"}`}>{meta.label}</p>
                      {active && <p className="text-xs text-ink/40">Current status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-6 rounded-2xl border border-ink/10 p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">Items ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-ink/25"><Package size={18} /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="mt-0.5 text-xs text-ink/40">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-ink">{formatNaira(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals + shipping */}
        <div className="grid gap-6 rounded-2xl border border-ink/10 p-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink/40">Shipping to</p>
            <p className="text-sm text-ink">{order.shippingName}</p>
            <p className="text-sm text-ink/60">{order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}</p>
            <p className="text-sm text-ink/60">{order.shippingCity}, {order.shippingState}, {order.shippingCountry}</p>
          </div>
          <div className="space-y-1.5 text-sm sm:border-l sm:border-ink/10 sm:pl-6">
            <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatNaira(order.discountAmount)}</span></div>}
            <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{order.shippingAmount ? formatNaira(order.shippingAmount) : "Free"}</span></div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink"><span>Total</span><span>{formatNaira(order.total)}</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}