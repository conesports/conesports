"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore, cartSubtotal } from "@/lib/store/cart";
import { formatNgn } from "@/lib/money";

export function CartView() {
  const { status } = useSession();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  async function changeQty(variantId: string, quantity: number) {
    updateQuantity(variantId, quantity);
    if (status === "authenticated") {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });
    }
  }

  async function remove(variantId: string) {
    removeItem(variantId);
    if (status === "authenticated") {
      await fetch(`/api/cart?variantId=${encodeURIComponent(variantId)}`, {
        method: "DELETE",
      });
    }
  }

  if (!items.length) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-start justify-between gap-4 border-b py-3 text-sm">
            <div>
              <Link href={`/product/${item.slug}`}>{item.name}</Link>
              <p>
                {item.size}
                {item.color ? ` / ${item.color}` : ""}
              </p>
              <p>{formatNgn(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                className="w-16 border px-2 py-1"
                value={item.quantity}
                onChange={(e) =>
                  changeQty(item.variantId, Number(e.target.value) || 1)
                }
              />
              <button type="button" className="underline" onClick={() => remove(item.variantId)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p>Subtotal {formatNgn(cartSubtotal(items))}</p>
      <Link href="/checkout" className="inline-block border px-3 py-2 text-sm">
        Checkout
      </Link>
    </div>
  );
}
