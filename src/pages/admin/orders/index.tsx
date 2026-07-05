import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { AdminPage } from "@/components/admin/AdminGuard";
import { StatusPill, EmptyState } from "@/components/admin/ui";
import { fetchClient, toArray } from "@/lib/fetchClient";
import { formatNaira } from "@/lib/payment/money";


interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  email: string;
  total: number;
  createdAt: string;
  items: { id: string }[];
  payment?: { status: string } | null;
}

const FILTERS = ["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status !== "ALL") qs.set("status", status);
    if (q) qs.set("q", q);
    qs.set("limit", "100");
    try {
      const res = await fetchClient<unknown>(`/api/admin/orders?${qs.toString()}`);
      setOrders(toArray<OrderRow>(res));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <AdminPage title="Orders">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                status === f ? "bg-ink text-white" : "bg-white text-ink/60 hover:bg-cream"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search # or email…"
            className="h-10 w-60 rounded-lg border border-ink/15 bg-white pl-9 pr-3 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" hint={status === "ALL" ? "Orders will appear here once customers check out." : `No ${status.toLowerCase()} orders.`} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-subtle" onClick={() => { window.location.href = `/admin/orders/${o.id}`; }}>
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link href={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{o.email}</td>
                  <td className="px-4 py-3 text-ink/70">{o.items.length}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatNaira(o.total)}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3 text-ink/50">{new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}