import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Tag } from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";

import { useCartStore } from "@/stores/cartStore";
import { useCheckout } from "@/features/checkout/useCheckout";
import { formatNaira } from "@/lib/payment/money";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const { submit, loading } = useCheckout();

  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState<string | undefined>("");
  const [fullName, setFullName] = useState(session?.user?.name ?? "");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const field = "w-full rounded-full border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink/40";
  const label = "mb-1.5 block text-sm text-ink/70";

  if (items.length === 0) {
    return (
      <Layout>
        <Seo title="Checkout" noIndex />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h2 className="mb-4 font-serif text-xl text-ink">Your cart is empty</h2>
          <Link href="/products" className="rounded-full bg-ink px-6 py-3 text-sm text-white hover:bg-ink-light">Shop Now</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title="Checkout" noIndex />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-[50px]">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* LEFT — order summary */}
          <div>
            <h1 className="mb-6 font-serif text-2xl text-ink">Your Order</h1>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b border-ink/5 pb-4">
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                    {item.image && <Image src={item.image} alt={item.name} width={80} height={96} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink/50">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatNaira(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Discount */}
            <div className="mt-6">
              <label className={label}>Discount code (optional)</label>
              <div className="flex items-center gap-2 rounded-full border border-ink/15 px-4">
                <Tag size={14} className="text-ink/40" />
                <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Enter code" className="flex-1 bg-transparent py-2.5 text-sm outline-none" />
              </div>
              <p className="mt-1.5 text-xs text-ink/40">Applied and verified securely at payment.</p>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-lg font-semibold text-ink"><span>Total</span><span>{formatNaira(subtotal)}</span></div>
              <p className="text-xs text-ink/40">Final total (incl. any discount) confirmed on the next step.</p>
            </div>
          </div>

          {/* RIGHT — details */}
          <div className="space-y-5">
            <div>
              <label className={label}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
            </div>

            <div>
              <label className={label}>Phone number</label>
              <div className="rounded-full border border-ink/15 px-4 py-3 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-sm">
                <PhoneInput international defaultCountry="NG" value={phone} onChange={setPhone} placeholder="Phone number" />
              </div>
            </div>

            <div>
              <label className={label}>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className={field} />
            </div>

            <div>
              <label className={label}>Street address</label>
              <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="123 Main Street" className={field} />
            </div>

            <div>
              <label className={label}>Apartment, suite, etc. (optional)</label>
              <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apt 4B" className={field} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Abuja" className={field} />
              </div>
              <div>
                <label className={label}>State</label>
                <input value={state} onChange={(e) => setState(e.target.value)} placeholder="FCT" className={field} />
              </div>
            </div>

            <button
              onClick={() => submit({ email, phone, fullName, line1, line2, city, state, discountCode })}
              disabled={loading}
              className="w-full rounded-full bg-accent py-4 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Redirecting to payment…" : `Pay ${formatNaira(subtotal)}`}
            </button>
            <p className="text-center text-xs text-ink/40">You'll complete payment securely on Paystack.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}