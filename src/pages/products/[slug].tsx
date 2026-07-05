import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ShoppingBag, Heart, Star, Minus, Plus, ShareNetwork, CaretRight,
  Truck, ArrowsClockwise, ShieldCheck,
} from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";

import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import ProductCard from "@/components/products/ProductCard";
import { useProduct, useProducts } from "@/features/products/useProducts";
import { formatNaira } from "@/lib/payment/money";

export default function ProductDetailPage() {
  const router = useRouter();
  const slug = router.query.slug as string | undefined;

  const { product, loading, notFound } = useProduct(slug);
  const { products: related } = useProducts({
    category: product?.category?.slug,
    limit: 4,
  });

  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "specs">("description");

  if (loading)
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-[50px]">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-6 w-3/4 rounded" />)}
            </div>
          </div>
        </div>
      </Layout>
    );

  if (notFound || !product)
    return (
      <Layout>
        <Seo title="Product not found" noIndex />
        <div className="py-24 text-center">
          <h2 className="mb-4 font-serif text-xl text-ink">Product not found</h2>
          <Link href="/products" className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">
            Back to Shop
          </Link>
        </div>
      </Layout>
    );

  const images = product.images ?? [];
  const activeImage = images[selectedImage] ?? null;
  const onSale = (product.compareAtPrice ?? 0) > product.price;
  const discount = onSale ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100) : 0;
  const outOfStock = product.stock <= 0;
  const wished = inWishlist(product.id);

  const handleAdd = () => {
    if (outOfStock) return;
    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: images[0] ?? null,
        stock: product.stock,
      },
      quantity
    );
  };

  const relatedFiltered = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <Seo
        title={product.name}
        description={product.description ?? undefined}
        image={images[0] ?? undefined}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-[50px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink/40">
          <Link href="/" className="hover:text-ink">Home</Link>
          <CaretRight size={12} />
          <Link href="/products" className="hover:text-ink">Shop</Link>
          {product.category && (
            <>
              <CaretRight size={12} />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          )}
          <CaretRight size={12} />
          <span className="line-clamp-1 text-ink/70">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
              {activeImage ? (
                <Image src={activeImage} alt={product.name} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink/20 font-serif">No image</div>
              )}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i === selectedImage ? "border-ink" : "border-transparent"}`}
                  >
                    <Image src={img} alt="" width={80} height={80} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink/50">{product.category.name}</p>
            )}
            <h1 className="mb-3 font-serif text-2xl leading-tight text-ink md:text-3xl">{product.name}</h1>

            <div className="mb-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} weight="fill" className="text-amber-400" />
              ))}
            </div>

            <div className="mb-6 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-ink">{formatNaira(product.price)}</span>
              {onSale && (
                <span className="text-lg text-ink/35 line-through">{formatNaira(product.compareAtPrice as number)}</span>
              )}
              {discount > 0 && <span className="text-sm font-medium text-accent">Save {discount}%</span>}
            </div>

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-ink/15">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-ink/50 hover:text-ink"><Minus size={16} /></button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} className="flex h-10 w-10 items-center justify-center text-ink/50 hover:text-ink"><Plus size={16} /></button>
              </div>
              <span className="text-sm text-ink/40">
                {outOfStock ? <span className="text-red-500">Out of stock</span> : `${product.stock} in stock`}
              </span>
            </div>

            {/* Actions */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-medium text-white transition-all hover:bg-ink-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={18} /> {outOfStock ? "Out of stock" : "Add to Cart"}
              </button>
              <button
                onClick={() => toggleWishlist({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: images[0] ?? null })}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${wished ? "border-red-300 bg-red-50 text-red-500" : "border-ink/15 text-ink/40 hover:border-red-300 hover:text-red-500"}`}
                aria-label="Wishlist"
              >
                <Heart size={18} weight={wished ? "fill" : "regular"} />
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 text-ink/40 transition-all hover:border-ink/40 hover:text-ink" aria-label="Share">
                <ShareNetwork size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-ink/10 py-4">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Over ₦50,000" },
                { icon: ArrowsClockwise, label: "30-Day Returns", sub: "Easy returns" },
                { icon: ShieldCheck, label: "Secure", sub: "Paystack" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center">
                  <Icon size={20} className="mb-1 text-ink" />
                  <span className="text-xs font-medium text-ink/70">{label}</span>
                  <span className="text-xs text-ink/40">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="mb-8 flex gap-1 border-b border-ink/15">
            {(["description", "specs"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-6 py-3 text-sm font-medium capitalize transition-all ${tab === t ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink/70"}`}
              >
                {t === "specs" ? "Details" : "Description"}
              </button>
            ))}
          </div>

          {tab === "description" ? (
            <div className="max-w-none text-sm leading-relaxed text-ink/70">
              {product.description || <p>No description available.</p>}
            </div>
          ) : (
            <dl className="max-w-lg divide-y divide-ink/10">
              <div className="flex py-3">
                <dt className="w-40 flex-shrink-0 text-sm font-medium text-ink/50">Category</dt>
                <dd className="text-sm text-ink">{product.category?.name ?? "—"}</dd>
              </div>
              <div className="flex py-3">
                <dt className="w-40 flex-shrink-0 text-sm font-medium text-ink/50">Availability</dt>
                <dd className="text-sm text-ink">{outOfStock ? "Out of stock" : `${product.stock} in stock`}</dd>
              </div>
            </dl>
          )}
        </div>

        {/* Related */}
        {relatedFiltered.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 font-serif text-2xl text-ink">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {relatedFiltered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}