"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore, type CartLine } from "@/lib/store/cart";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [pending, setPending] = useState(false);

  async function reorder() {
    setPending(true);
    const res = await fetch(`/api/account/orders/${orderId}/reorder`, {
      method: "POST",
    });
    const data = (await res.json()) as { items?: CartLine[]; error?: string };
    setPending(false);
    if (!res.ok) {
      alert(data.error ?? "Reorder failed");
      return;
    }
    for (const item of data.items ?? []) {
      addItem(item, item.quantity);
    }
    router.push("/cart");
  }

  return (
    <button type="button" className="border px-3 py-1 text-sm" onClick={reorder} disabled={pending}>
      {pending ? "Adding…" : "Reorder"}
    </button>
  );
}
