import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, PencilSimple, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { StatusPill, EmptyState } from "@/components/admin/ui";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { fetchClient, toArray } from "@/lib/fetchClient";

import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/payment/money";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    qs.set("limit", "100");
    try {
      const res = await fetchClient<unknown>(`/api/admin/products?${qs.toString()}`);
      setProducts(toArray<Product>(res));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0); // debounce search
    return () => clearTimeout(t);
  }, [load, q]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeleting(id);
    try {
      await fetchClient(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminPage title="Products">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-64 rounded-lg border border-ink/15 bg-white pl-9 pr-3 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-light">
          <Plus size={16} /> New Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          hint="Add your first product to start selling."
          action={<Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white hover:bg-ink-light"><Plus size={16} /> New Product</Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-subtle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                        <CloudinaryImage src={p.images?.[0]} alt={p.name} width={44} height={44} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{p.name}</p>
                        <p className="truncate text-xs text-ink/40">{p.category?.name ?? "Uncategorized"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{formatNaira(p.price)}</td>
                  <td className="px-4 py-3 text-ink/70">{p.stock}</td>
                  <td className="px-4 py-3"><StatusPill status={p.status ?? "DRAFT"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg p-2 text-ink/50 hover:bg-cream hover:text-ink" aria-label="Edit"><PencilSimple size={16} /></Link>
                      <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id} className="rounded-lg p-2 text-ink/50 hover:bg-red-50 hover:text-red-500 disabled:opacity-40" aria-label="Delete"><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}