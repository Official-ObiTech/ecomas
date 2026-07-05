import { useState } from "react";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";
import { fetchClient } from "@/lib/fetchClient";
import { startPayment } from "@/features/checkout/usePaystack";
import { useCartStore } from "@/stores/cartStore";

export interface CheckoutForm {
  email: string;
  phone?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  discountCode?: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const items = useCartStore((s) => s.items);

  async function submit(form: CheckoutForm) {
    if (!items.length) return toast.error("Your cart is empty");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.phone || !isValidPhoneNumber(form.phone)) return toast.error("Enter a valid phone number");
    if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      return toast.error("Please complete your shipping address");
    }

    setLoading(true);
    try {
      // 1) create PENDING order — API recomputes every price from the DB
      const res = await fetchClient<{ data: { orderNumber: string } }>("/api/orders", {
        method: "POST",
        body: {
          email: form.email.trim(),
          phone: form.phone,
          shipping: {
            fullName: form.fullName.trim(),
            phone: form.phone,
            line1: form.line1.trim(),
            line2: form.line2?.trim() || undefined,
            city: form.city.trim(),
            state: form.state.trim(),
            country: "Nigeria",
          },
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          discountCode: form.discountCode?.trim() || undefined,
        },
      });

      // 2) hand off to Paystack (redirects the browser)
      await startPayment(res.data.orderNumber);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return { submit, loading };
}