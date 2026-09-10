"use client";

import { useState } from "react";

export function CustomerEditor({
  id,
  notes,
  marketingOptIn,
}: {
  id: string;
  notes: string;
  marketingOptIn: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setOk(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: String(form.get("notes") ?? ""),
        marketingOptIn: form.get("marketingOptIn") === "on",
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setOk(true);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 text-sm">
      <label className="flex items-center gap-2">
        <input type="checkbox" name="marketingOptIn" defaultChecked={marketingOptIn} />
        Marketing opt-in
      </label>
      <label className="block">
        Notes
        <textarea name="notes" rows={5} defaultValue={notes} className="mt-1 w-full border px-2 py-1" />
      </label>
      {error ? <p className="text-red-600">{error}</p> : null}
      {ok ? <p>Saved.</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
