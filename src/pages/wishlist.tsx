import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { formatNaira } from "@/lib/payment/money";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const toggle = useWishlistStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.addToCart);

  const moveToCart = (item: (typeof items)[number]) => {
    addToCart(
      {
        productId: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        image: item.image ?? null,
        stock: 99, // wishlist doesn't track live stock; cart/checkout re-validates
      },
      1
    );
    toggle(item); // remove from wishlist after moving
    toast.success("Moved to cart");
  };

  return (
    <Layout>
      <Seo title="Wishlist" noIndex />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-[50px]">
        <h1 className="mb-8 font-serif text-2xl text-ink">Your Wishlist</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <Heart size={40} className="mx-auto mb-4 text-ink/15" />
            <p className="mb-6 text-ink/50">Your wishlist is empty.</p>
            <Link href="/products" className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                  <Link href={`/products/${item.slug}`}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink/20"><span className="font-serif text-sm">No image</span></div>
                    )}
                  </Link>
                  <button
                    onClick={() => toggle(item)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink/60 shadow-sm hover:text-red-500"
                    aria-label="Remove from wishlist"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="pt-3">
                  <Link href={`/products/${item.slug}`} className="truncate text-sm font-medium text-ink hover:underline">{item.name}</Link>
                  <p className="mt-1 text-sm font-bold text-ink">{formatNaira(item.price)}</p>
                  <button
                    onClick={() => moveToCart(item)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    <ShoppingBag size={15} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
