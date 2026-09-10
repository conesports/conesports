"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  listPrice: number;
  discountPercent: number;
  size: string;
  color: string;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  guestEmail: string;
  guestPhone: string;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  replaceCart: (items: CartLine[]) => void;
  setGuestContact: (email: string, phone?: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      guestEmail: "",
      guestPhone: "",
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity } : i,
                ),
        })),
      clearCart: () => set({ items: [] }),
      replaceCart: (items) => set({ items }),
      setGuestContact: (email, phone) =>
        set({
          guestEmail: email.trim(),
          guestPhone: phone?.trim() ?? "",
        }),
    }),
    { name: "conesports-cart" },
  ),
);

export function cartCount(items: CartLine[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartLine[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
