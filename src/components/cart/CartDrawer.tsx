import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { X, Plus, Minus, Trash, ShoppingBag } from "@phosphor-icons/react";
import { useCartStore } from "@/stores/cartStore";
import { formatNaira } from "@/lib/payment/money";


export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, closeCart, items, totalItems, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const goCheckout = () => { closeCart(); router.push("/checkout"); };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={closeCart} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-ink" />
            <h2 className="font-serif text-lg text-ink">Cart</h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-bold text-ink">{totalItems}</span>
            )}
          </div>
          <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <ShoppingBag size={48} className="mb-4 text-ink/15" />
              <p className="mb-6 text-ink/50">Your cart is empty</p>
              <button onClick={closeCart} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-light">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 border-b border-ink/5 py-4">
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={80} height={96} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink/30"><ShoppingBag size={24} /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-ink">{item.name}</p>
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
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t border-ink/10 px-6 py-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <p className="text-xs text-ink/40">Shipping calculated at checkout</p>
            </div>
            <button onClick={goCheckout} className="w-full rounded-full bg-ink py-3.5 text-sm font-medium text-white hover:bg-ink-light">
              Checkout · {formatNaira(subtotal)}
            </button>
            <button onClick={closeCart} className="w-full rounded-full border border-ink/15 py-2.5 text-sm text-ink/60 hover:bg-cream">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}