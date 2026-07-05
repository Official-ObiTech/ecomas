import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminGuard";
import { StatCard, StatusPill } from "@/components/admin/ui";
import { fetchClient } from "@/lib/fetchClient";
import { formatNaira } from "@/lib/payment/money";


interface Stats {
  productCount: number;
  orderCount: number;
  customerCount: number;
  pendingCount: number;
  revenue: number;
  recentOrders: { id: string; orderNumber: string; status: string; total: number; email: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient<{ data: Stats }>("/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage title="Dashboard">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : !stats ? (
        <p className="text-ink/50">Couldn't load dashboard stats.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatNaira(stats.revenue)} hint="Paid orders" />
            <StatCard label="Orders" value={String(stats.orderCount)} hint={`${stats.pendingCount} pending`} />
            <StatCard label="Products" value={String(stats.productCount)} />
            <StatCard label="Customers" value={String(stats.customerCount)} />
          </div>

          <div className="mt-8 rounded-xl border border-ink/10 bg-white">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Recent orders</h2>
              <Link href="/admin/orders" className="text-sm text-accent hover:underline">View all</Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-ink/40">No orders yet.</p>
            ) : (
              <div className="divide-y divide-ink/5">
                {stats.recentOrders.map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-subtle">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{o.orderNumber}</p>
                      <p className="truncate text-xs text-ink/50">{o.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusPill status={o.status} />
                      <span className="text-sm font-semibold text-ink">{formatNaira(o.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminPage>
  );
}