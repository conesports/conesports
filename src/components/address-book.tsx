"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Address = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  isDefault: boolean;
};

export function AddressBook({ initial }: { initial: Address[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.get("label"),
        line1: form.get("line1"),
        line2: form.get("line2"),
        city: form.get("city"),
        state: form.get("state"),
        country: form.get("country"),
        postalCode: form.get("postalCode"),
        isDefault: form.get("isDefault") === "on",
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error ?? "Save failed");
    else {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  async function setDefault(id: string) {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-3 text-sm">
        {initial.map((a) => (
          <li key={a.id} className="border p-3">
            <p>{a.label ?? "Address"} {a.isDefault ? "(default)" : ""}</p>
            <p>{a.line1}</p>
            <p>{[a.city, a.state, a.country].filter(Boolean).join(", ")}</p>
            <button type="button" className="mr-2 underline" onClick={() => setDefault(a.id)}>
              Set default
            </button>
            <button type="button" className="underline" onClick={() => remove(a.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="max-w-md space-y-2 text-sm">
        <h2 className="font-medium">Add address</h2>
        <input name="label" placeholder="Label" className="w-full border px-2 py-1" />
        <input name="line1" required placeholder="Line 1" className="w-full border px-2 py-1" />
        <input name="line2" placeholder="Line 2" className="w-full border px-2 py-1" />
        <input name="city" required placeholder="City" className="w-full border px-2 py-1" />
        <input name="state" placeholder="State" className="w-full border px-2 py-1" />
        <input name="country" required defaultValue="NG" placeholder="Country" className="w-full border px-2 py-1" />
        <input name="postalCode" placeholder="Postal code" className="w-full border px-2 py-1" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isDefault" /> Default
        </label>
        {error ? <p className="text-red-600">{error}</p> : null}
        <button type="submit" className="border px-3 py-1">Add</button>
      </form>
    </div>
  );
}
