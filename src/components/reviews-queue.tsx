"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  createdAt: string;
  productName: string;
  productSlug: string;
  customerName: string | null;
  customerEmail: string;
};

export function ReviewsQueue({
  items,
  status,
}: {
  items: ReviewRow[];
  status: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  async function setStatus(id: string, next: "APPROVED" | "REJECTED") {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function bulk(next: "APPROVED" | "REJECTED") {
    if (!selected.length) return;
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, status: next }),
    });
    setSelected([]);
    router.refresh();
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <form>
        <label>
          Status{" "}
          <select name="status" defaultValue={status} className="border px-2 py-1">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>{" "}
        <button type="submit" className="border px-2 py-1">
          Filter
        </button>
      </form>
      <div className="flex gap-2">
        <button type="button" className="border px-2 py-1" onClick={() => bulk("APPROVED")}>
          Approve selected
        </button>
        <button type="button" className="border px-2 py-1" onClick={() => bulk("REJECTED")}>
          Reject selected
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b py-2" />
            <th className="border-b py-2">Product</th>
            <th className="border-b py-2">Customer</th>
            <th className="border-b py-2">Rating</th>
            <th className="border-b py-2">Review</th>
            <th className="border-b py-2">Status</th>
            <th className="border-b py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td className="border-b py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggle(r.id)}
                />
              </td>
              <td className="border-b py-2">
                <Link href={`/product/${r.productSlug}`}>{r.productName}</Link>
              </td>
              <td className="border-b py-2">
                {r.customerName ?? "—"}
                <br />
                {r.customerEmail}
              </td>
              <td className="border-b py-2">{r.rating}/5</td>
              <td className="border-b py-2">
                {r.title ? <p className="font-medium">{r.title}</p> : null}
                <p>{r.body}</p>
              </td>
              <td className="border-b py-2">{r.status}</td>
              <td className="border-b py-2">
                <button type="button" className="mr-2 underline" onClick={() => setStatus(r.id, "APPROVED")}>
                  Approve
                </button>
                <button type="button" className="underline" onClick={() => setStatus(r.id, "REJECTED")}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
