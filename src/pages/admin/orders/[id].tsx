import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Package } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { StatusPill } from "@/components/admin/ui";
import { fetchClient } from "@/lib/fetchClient";

import type { OrderStatus } from "@prisma/client";
import { nextStates } from "@/lib/order/orderState";
import { formatNaira } from "@/lib/payment/money";

interface Item { id: string; name: string; image: string | null; quantity: number; price: number; subtotal: number; }
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email: string;
  phone: string;
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
  items: Item[];
  payment?: { status: string; reference: string; channel?: string | null; paidAt?: string | null } | null;
  discount?: { code: string } | null;
  user?: { name: string | null; email: string } | null;
}

export default function AdminOrderDetail() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pending, setPending] = useState<OrderStatus | "">("");

  useEffect(() => {
    if (!id) return;
    fetchClient<{ data: Order }>(`/api/admin/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error("Couldn't load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const applyStatus = async () => {
    if (!order || !pending) return;
    setUpdating(true);
    try {
      const res = await fetchClient<{ data: Order }>(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: { status: pending },
      });
      setOrder((prev) => (prev ? { ...prev, status: res.data.status } : prev));
      setPending("");
      toast.success(`Marked ${pending}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return <AdminPage title="Order"><div className="skeleton h-96 rounded-xl" /></AdminPage>;

  if (!order)
    return (
      <AdminPage title="Order">
        <p className="text-ink/50">Order not found.</p>
      </AdminPage>
    );

  const options = nextStates(order.status);

  return (
    <AdminPage title={`Order ${order.orderNumber}`}>
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-ink/10 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">Items</h2>
              <StatusPill status={order.status} />
            </div>
            <div className="space-y-4">
              {order.items.map((it) => (
                <div key={it.id} className="flex gap-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                    {it.image ? <img src={it.image} alt={it.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-ink/25"><Package size={16} /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{it.name}</p>
                    <p className="text-xs text-ink/40">{formatNaira(it.price)} × {it.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatNaira(it.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount{order.discount ? ` (${order.discount.code})` : ""}</span><span>-{formatNaira(order.discountAmount)}</span></div>}
              <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{order.shippingAmount ? formatNaira(order.shippingAmount) : "Free"}</span></div>
              <div className="flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink"><span>Total</span><span>{formatNaira(order.total)}</span></div>
            </div>
          </div>
        </div>

        {/* Side */}
        <div className="space-y-6">
          {/* Status control */}
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="mb-3 text-sm font-medium text-ink">Update status</p>
            {options.length === 0 ? (
              <p className="text-sm text-ink/50">This order is in a final state — no further changes.</p>
            ) : (
              <div className="space-y-3">
                <select
                  value={pending}
                  onChange={(e) => setPending(e.target.value as OrderStatus)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-ink/40"
                >
                  <option value="">Choose next status…</option>
                  {options.map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <button
                  onClick={applyStatus}
                  disabled={!pending || updating}
                  className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white hover:bg-ink-light disabled:opacity-50"
                >
                  {updating ? "Updating…" : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="mb-3 text-sm font-medium text-ink">Customer</p>
            <div className="space-y-1 text-sm text-ink/70">
              <p>{order.user?.name ?? order.shippingName}</p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
              <p className="mt-1 text-xs text-ink/40">{order.user ? "Registered account" : "Guest checkout"}</p>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="mb-3 text-sm font-medium text-ink">Shipping</p>
            <div className="space-y-0.5 text-sm text-ink/70">
              <p>{order.shippingName}</p>
              <p>{order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}</p>
              <p>{order.shippingCity}, {order.shippingState}</p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="mb-3 text-sm font-medium text-ink">Payment</p>
            {order.payment ? (
              <div className="space-y-1 text-sm text-ink/70">
                <p className={order.payment.status === "SUCCESS" ? "text-green-600" : "text-amber-600"}>
                  {order.payment.status === "SUCCESS" ? "Paid" : order.payment.status}
                </p>
                <p className="text-xs text-ink/40">Ref: {order.payment.reference}</p>
                {order.payment.channel && <p className="text-xs text-ink/40">via {order.payment.channel}</p>}
              </div>
            ) : (
              <p className="text-sm text-ink/50">No payment recorded.</p>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}