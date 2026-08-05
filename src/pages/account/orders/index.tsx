import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, CaretRight } from "@phosphor-icons/react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Seo } from "@/components/seo/Seo";
import { fetchClient, toArray } from "@/lib/fetchClient";
import { formatNaira } from "@/lib/payment/money";
import { StatusPill } from "@/components/admin/ui";

interface OrderRow {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string }[];
}

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient<unknown>("/api/account/orders")
      .then((res) => setOrders(toArray<OrderRow>(res)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountLayout>
      <Seo title="My Orders" noIndex />
      <h2 className="mb-5 font-serif text-lg text-ink">My Orders</h2>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <Package size={32} className="mx-auto mb-3 text-ink/25" />
          <p className="mb-5 text-sm text-ink/50">You haven't placed any orders yet.</p>
          <Link href="/products" className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.orderNumber}
              href={`/account/orders/${o.orderNumber}`}
              className="flex items-center justify-between rounded-xl border border-ink/10 p-5 hover:bg-cream"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{o.orderNumber}</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{o.items.length} item{o.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusPill status={o.status} />
                <span className="text-sm font-semibold text-ink">{formatNaira(o.total)}</span>
                <CaretRight size={16} className="text-ink/30" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}