"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useCartStore, type CartLine } from "@/lib/store/cart";

export function CartHydrator() {
  const { status } = useSession();
  const didMerge = useRef(false);
  const replaceCart = useCartStore((s) => s.replaceCart);

  useEffect(() => {
    if (status === "unauthenticated") didMerge.current = false;
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || didMerge.current) return;
    didMerge.current = true;

    const guestItems = useCartStore.getState().items;
    const run = async () => {
      if (guestItems.length) {
        const res = await fetch("/api/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: guestItems.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          }),
        });
        const data = (await res.json()) as { items?: CartLine[] };
        if (data.items) replaceCart(data.items);
        return;
      }
      const res = await fetch("/api/cart");
      const data = (await res.json()) as { items?: CartLine[] };
      if (data.items) replaceCart(data.items);
    };
    void run();
  }, [status, replaceCart]);

  return null;
}
