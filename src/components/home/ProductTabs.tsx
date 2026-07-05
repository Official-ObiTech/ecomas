import { useState, useMemo } from "react";
import Link from "next/link";
import { useProducts } from "@/features/products/useProducts";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";

type Tab = "featured" | "new" | "sale";
const labels: Record<Tab, string> = { featured: "Best Sellers", new: "New Arrivals", sale: "Sale" };

export function ProductTabs() {
  const [tab, setTab] = useState<Tab>("featured");
  const { products: featured, loading: l1 } = useProducts({ featured: true, limit: 8 });
  const { products: latest, loading: l2 } = useProducts({ limit: 8 });

  const onSale = useMemo(
    () => latest.filter((p) => (p.compareAtPrice ?? 0) > p.price),
    [latest]
  );

  const map = { featured, new: latest, sale: onSale };
  const loading = tab === "featured" ? l1 : l2;
  const list = map[tab];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-[50px]">
      <div className="mb-10 flex justify-center gap-8">
        {(Object.keys(labels) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-1 text-lg transition-all ${
              tab === t ? "font-semibold text-ink underline underline-offset-8" : "text-ink/40 hover:text-ink/70"
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {list.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="py-10 text-center text-ink/40">No {labels[tab].toLowerCase()} yet.</p>
      )}

      <div className="mt-12 text-center">
        <Link href="/products" className="inline-block rounded-full bg-accent px-10 py-3.5 text-sm font-semibold text-white transition-colors hover:opacity-90">
          View All
        </Link>
      </div>
    </section>
  );
}