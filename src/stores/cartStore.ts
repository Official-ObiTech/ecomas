import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProductInput {
  productId: string;
  name: string;
  slug: string;
  price: number; // kobo
  image?: string | null;
  stock?: number;
}
export interface CartItem extends CartProductInput {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: CartProductInput, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const count = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.productId);
          const items = existing
            ? state.items.map((i) =>
                i.productId === product.productId ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { ...product, quantity }];
          return { items, totalItems: count(items), isOpen: true };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
          return { items, totalItems: count(items) };
        }),

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return { items, totalItems: count(items) };
        }),

      clear: () => set({ items: [], totalItems: 0 }),
    }),
    { name: "ecomas-cart" }
  )
);