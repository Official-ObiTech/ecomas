import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";

import { useCartStore } from "@/stores/cartStore";
import { formatNaira } from "@/lib/payment/money";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Layout>
      <Seo title="Cart" noIndex />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-[50px]">
        <h1 className="mb-8 font-serif text-2xl text-ink">Your Cart</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-6 text-ink/50">Your cart is empty.</p>
            <Link href="/products" className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b border-ink/5 pb-4">
                  <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                    {item.image && <Image src={item.image} alt={item.name} width={96} height={112} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${item.slug}`} className="text-sm font-medium text-ink hover:underline">{item.name}</Link>
                    <p className="mt-1 text-sm text-ink/50">{formatNaira(item.price)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-ink/15 px-2 py-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease" className="flex h-6 w-6 items-center justify-center text-ink/50 hover:text-ink"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Increase" className="flex h-6 w-6 items-center justify-center text-ink/50 hover:text-ink"><Plus size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink">{formatNaira(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.productId)} aria-label="Remove" className="text-ink/25 hover:text-red-500"><Trash size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-2xl border border-ink/10 p-6">
              <h2 className="mb-4 font-serif text-lg text-ink">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
                <p className="text-xs text-ink/40">Shipping & discounts calculated at checkout</p>
              </div>
              <Link href="/checkout" className="mt-6 block rounded-full bg-ink py-3.5 text-center text-sm font-medium text-white hover:bg-ink-light">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}