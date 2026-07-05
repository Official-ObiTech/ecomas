import { useProducts } from "@/features/products/useProducts";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";

interface ProductRowProps {
  title: string;
  featured?: boolean;
  limit?: number;
}

export function ProductRow({ title, featured, limit = 4 }: ProductRowProps) {
  const { products, loading } = useProducts({ featured, limit });

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-[50px]">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-3xl text-ink">{title}</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.slice(0, limit).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="py-10 text-center text-ink/40">No products yet.</p>
      )}
    </section>
  );
}