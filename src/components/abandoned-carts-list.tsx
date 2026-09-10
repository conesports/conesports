"use client";

import { useRouter } from "next/navigation";

type Row = {
  id: string;
  sessionId: string;
  email: string | null;
  phone: string | null;
  itemCount: number;
  subtotal: string;
  updatedAt: string;
  contactedAt: string | null;
};

export function AbandonedCartsList({ items }: { items: Row[] }) {
  const router = useRouter();

  async function markContacted(id: string) {
    await fetch(`/api/admin/abandoned-carts/${id}/contact`, { method: "POST" });
    router.refresh();
  }

  if (!items.length) return <p className="text-sm">No idle carts.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          <th className="border-b py-2">Email / session</th>
          <th className="border-b py-2">Phone</th>
          <th className="border-b py-2">Items</th>
          <th className="border-b py-2">Subtotal</th>
          <th className="border-b py-2">Last updated</th>
          <th className="border-b py-2">Contacted</th>
          <th className="border-b py-2" />
        </tr>
      </thead>
      <tbody>
        {items.map((c) => (
          <tr key={c.id}>
            <td className="border-b py-2">
              {c.email ?? "—"}
              <br />
              <span className="text-zinc-500">{c.sessionId.slice(0, 16)}</span>
            </td>
            <td className="border-b py-2">{c.phone ?? "—"}</td>
            <td className="border-b py-2">{c.itemCount}</td>
            <td className="border-b py-2">{c.subtotal}</td>
            <td className="border-b py-2">{c.updatedAt.replace("T", " ").slice(0, 16)}</td>
            <td className="border-b py-2">
              {c.contactedAt ? c.contactedAt.replace("T", " ").slice(0, 16) : "—"}
            </td>
            <td className="border-b py-2">
              {!c.contactedAt ? (
                <button type="button" className="underline" onClick={() => markContacted(c.id)}>
                  Mark contacted
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
