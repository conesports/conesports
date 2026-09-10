"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this product?")) return;
    setPending(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      alert(data.error ?? "Delete failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="border px-3 py-1.5 text-sm"
      disabled={pending}
      onClick={onDelete}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
