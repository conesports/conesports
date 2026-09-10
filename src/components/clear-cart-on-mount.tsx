"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

export function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    clearCart();
    void fetch("/api/cart", { method: "DELETE" }).catch(() => undefined);
  }, [clearCart]);
  return null;
}
