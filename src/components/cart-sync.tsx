"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { cartSubtotal, useCartStore } from "@/lib/store/cart";

export function CartSync() {
  const { data } = useSession();
  const items = useCartStore((s) => s.items);
  const guestEmail = useCartStore((s) => s.guestEmail);
  const guestPhone = useCartStore((s) => s.guestPhone);

  useEffect(() => {
    function snapshot() {
      const state = useCartStore.getState();
      return {
        items: state.items,
        email: data?.user?.email || state.guestEmail || undefined,
        phone: state.guestPhone || undefined,
        subtotal: cartSubtotal(state.items),
      };
    }

    function ping() {
      void fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot()),
      });
    }

    ping();
    const t = setInterval(ping, 45_000);
    return () => clearInterval(t);
  }, [items, data?.user?.email, guestEmail, guestPhone]);

  return null;
}
