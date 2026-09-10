"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCartStore, type CartLine } from "@/lib/store/cart";

export function AddToCartButton({ item }: { item: Omit<CartLine, "quantity"> }) {
  const { status } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function add() {
    setPending(true);
    setMessage(null);
    addItem(item, 1);
    if (status === "authenticated") {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: item.variantId, quantity: 1 }),
      });
    }
    setPending(false);
    setMessage("Added to cart");
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={add}
        className="border px-3 py-2 text-sm"
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {message ? <p className="mt-2 text-sm">{message}</p> : null}
    </div>
  );
}
