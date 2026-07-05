import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, Star } from "@phosphor-icons/react";

import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/payment/money";

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has);

  const img = product.images?.[0] ?? null;
  const onSale = (product.compareAtPrice ?? 0) > product.price;
  const discount = onSale
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = (e: React.MouseEvent) => {
    stop(e);
    if (outOfStock) return;
    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: img,
        stock: product.stock,
      },
      1
    );
  };

  const handleWishlist = (e: React.MouseEvent) => {
    stop(e);
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: img,
    });
  };

  const wished = inWishlist(product.id);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/20">
            <span className="font-serif text-sm">No image</span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 ? (
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">-{discount}%</span>
          ) : product.featured ? (
            <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">New</span>
          ) : null}
        </div>

        {/* Hover action rail */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 rounded-full bg-white p-1.5 shadow-md transition-all sm:translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-cream ${wished ? "text-red-500" : "text-ink"}`}
          >
            <Heart size={16} weight={wished ? "fill" : "regular"} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream">
            <Eye size={16} />
          </span>
        </div>

        {/* Add-to-cart pill */}
        <div className="absolute inset-x-4 bottom-4 transition-all sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-ink shadow-md transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="pt-3">
        <div className="mb-1.5 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} weight={i < 5 ? "fill" : "regular"} className="text-amber-500" />
          ))}
        </div>

        {product.category && (
          <p className="mb-0.5 text-xs uppercase tracking-wide text-ink/40">{product.category.name}</p>
        )}

        <h3 className="truncate text-sm font-medium text-ink">{product.name}</h3>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{formatNaira(product.price)}</span>
          {onSale && (
            <span className="text-xs text-ink/35 line-through">{formatNaira(product.compareAtPrice as number)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}