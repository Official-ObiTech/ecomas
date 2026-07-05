import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SlidersHorizontal, X, CaretRight } from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { useCategories } from "@/features/categories/useCategories";
import { useProductList } from "@/features/products/useProductList";

const LIMIT = 16;

export default function ProductsPage() {
  const router = useRouter();
  const { categories } = useCategories();

  // read state from URL
  const q = (router.query.q as string) ?? "";
  const category = (router.query.category as string) ?? "";
  const sort = (router.query.sort as string) ?? "createdAt_desc";
  const page = Math.max(1, Number(router.query.page) || 1);

  const { products, pagination, loading } = useProductList({ category, q, page, limit: LIMIT });

  // client-side sort of the current page (see note above)
  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort]);

  const setParam = (key: string, value: string) => {
    const next = { ...router.query };
    if (!value) delete next[key];
    else next[key] = value;
    if (key !== "page") next.page = "1"; // reset page on any filter change
    router.push({ pathname: "/products", query: next });
  };

  const clearAll = () => router.push("/products");

  const activeChips = [
    category && { key: "category", label: categories.find((c) => c.slug === category)?.name ?? "Category" },
    q && { key: "q", label: `“${q}”` },
  ].filter(Boolean) as { key: string; label: string }[];

  const total = pagination?.total ?? sorted.length;
  const totalPages = pagination?.pages ?? 1;

  const pageNumbers: (number | "…")[] =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, 4, "…", totalPages - 1, totalPages];

  return (
    <Layout>
      <Seo title="Shop" description="Browse all products." />

      {/* Ink hero banner */}
      <section className="bg-ink px-4 sm:px-6 lg:px-[50px]">
        <div className="mx-auto max-w-7xl py-16 text-center text-white">
          <nav className="mb-4 flex items-center justify-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <CaretRight size={12} />
            <span className="text-white">Shop</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl">Shop</h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-[50px]">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-60 flex-shrink-0 lg:block">
            <h2 className="mb-6 font-serif text-xl text-ink">Filter</h2>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/50">Categories</p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setParam("category", "")}
                    className={`text-sm transition-colors ${!category ? "font-medium text-ink underline underline-offset-4" : "text-ink/60 hover:text-ink"}`}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setParam("category", cat.slug)}
                      className={`text-sm transition-colors ${category === cat.slug ? "font-medium text-ink underline underline-offset-4" : "text-ink/60 hover:text-ink"}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-ink/60">{total} products</p>
              <div className="flex items-center gap-4">
                <SlidersHorizontal size={16} className="text-ink/40 lg:hidden" />
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="appearance-none rounded-lg border border-ink/15 bg-white px-4 py-2 pr-8 text-sm text-ink/70 outline-none focus:border-ink/40"
                >
                  <option value="createdAt_desc">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setParam(chip.key, "")}
                    className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-sm text-ink/70 hover:border-ink/40"
                  >
                    <X size={12} /> {chip.label}
                  </button>
                ))}
                <button onClick={clearAll} className="flex items-center gap-1 text-sm text-ink/50 hover:text-ink">
                  <X size={12} /> Clear All
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : sorted.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {pageNumbers.map((p, i) =>
                      p === "…" ? (
                        <span key={`e${i}`} className="px-2 text-sm text-ink/40">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setParam("page", String(p))}
                          className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                            p === page ? "bg-ink text-white" : "border border-ink/15 text-ink/60 hover:border-ink/40"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center">
                <h3 className="mb-2 font-serif text-xl text-ink">No products found</h3>
                <p className="mb-6 text-ink/50">Try adjusting your filters.</p>
                <button onClick={clearAll} className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}