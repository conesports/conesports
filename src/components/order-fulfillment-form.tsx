"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FULFILLMENT_STATUSES } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export function OrderFulfillmentForm({
  orderId,
  status,
  trackingNumber,
  carrier,
  adminNotes,
}: {
  orderId: string;
  status: OrderStatus;
  trackingNumber: string | null;
  carrier: string | null;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        trackingNumber: String(form.get("trackingNumber") ?? "") || null,
        carrier: String(form.get("carrier") ?? "") || null,
        adminNotes: String(form.get("adminNotes") ?? "") || null,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Update failed");
      return;
    }
    router.refresh();
  }

  async function verify() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
      method: "POST",
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Verify failed");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3 text-sm">
      <label className="block">
        Status
        <select name="status" defaultValue={status} className="mt-1 w-full border px-2 py-1">
          {FULFILLMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Tracking number
        <input
          name="trackingNumber"
          defaultValue={trackingNumber ?? ""}
          className="mt-1 w-full border px-2 py-1"
        />
      </label>
      <label className="block">
        Carrier
        <input
          name="carrier"
          defaultValue={carrier ?? ""}
          className="mt-1 w-full border px-2 py-1"
        />
      </label>
      <label className="block">
        Admin notes
        <textarea
          name="adminNotes"
          defaultValue={adminNotes ?? ""}
          className="mt-1 w-full border px-2 py-1"
          rows={3}
        />
      </label>
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="border px-3 py-1">
          Save
        </button>
        <button type="button" disabled={pending} className="border px-3 py-1" onClick={verify}>
          Verify payment
        </button>
      </div>
    </form>
  );
}
