"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { koboToNaira } from "@/lib/money";

type DiscountRow = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  minOrderValue: number;
  active: boolean;
  redemptionCount: number;
};

function displayValue(row: DiscountRow) {
  return row.type === "PERCENT" ? row.value : koboToNaira(row.value);
}

export function DiscountsEditor({ initial }: { initial: DiscountRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.get("code"),
        type: form.get("type"),
        value: Number(form.get("value")),
        expiresAt: form.get("expiresAt") || null,
        usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : null,
        minOrderValue: Number(form.get("minOrderValue") || 0),
        active: form.get("active") === "on",
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create discount");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  async function toggleActive(row: DiscountRow) {
    await fetch(`/api/admin/discounts/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Code</th>
            <th className="border-b py-2">Type</th>
            <th className="border-b py-2">Value</th>
            <th className="border-b py-2">Min order (₦)</th>
            <th className="border-b py-2">Uses</th>
            <th className="border-b py-2">Expires</th>
            <th className="border-b py-2">Active</th>
            <th className="border-b py-2" />
          </tr>
        </thead>
        <tbody>
          {initial.map((row) => (
            <tr key={row.id}>
              <td className="border-b py-2">{row.code}</td>
              <td className="border-b py-2">{row.type}</td>
              <td className="border-b py-2">
                {row.type === "PERCENT" ? `${row.value}%` : `₦${displayValue(row)}`}
              </td>
              <td className="border-b py-2">{koboToNaira(row.minOrderValue)}</td>
              <td className="border-b py-2">
                {row.usageCount}
                {row.usageLimit != null ? ` / ${row.usageLimit}` : ""}
              </td>
              <td className="border-b py-2">
                {row.expiresAt ? row.expiresAt.slice(0, 10) : "—"}
              </td>
              <td className="border-b py-2">{row.active ? "Yes" : "No"}</td>
              <td className="border-b py-2">
                <button type="button" className="mr-2 underline" onClick={() => toggleActive(row)}>
                  {row.active ? "Disable" : "Enable"}
                </button>
                <button type="button" className="underline" onClick={() => remove(row.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={create} className="max-w-md space-y-2 text-sm">
        <h2 className="font-medium">New code</h2>
        <input name="code" required placeholder="Code" className="w-full border px-2 py-1" />
        <select name="type" className="w-full border px-2 py-1">
          <option value="PERCENT">Percent</option>
          <option value="FIXED">Fixed ₦</option>
        </select>
        <input name="value" type="number" min={0} required placeholder="Value (% or ₦)" className="w-full border px-2 py-1" />
        <input name="minOrderValue" type="number" min={0} defaultValue={0} placeholder="Min order ₦" className="w-full border px-2 py-1" />
        <input name="usageLimit" type="number" min={1} placeholder="Usage limit (optional)" className="w-full border px-2 py-1" />
        <input name="expiresAt" type="date" className="w-full border px-2 py-1" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked /> Active
        </label>
        {error ? <p className="text-red-600">{error}</p> : null}
        <button type="submit" disabled={pending} className="border px-3 py-1">
          {pending ? "Saving…" : "Create"}
        </button>
      </form>
    </div>
  );
}
