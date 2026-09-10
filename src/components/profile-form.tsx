"use client";

import { useState } from "react";

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
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
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        currentPassword: form.get("currentPassword") || undefined,
        newPassword: form.get("newPassword") || undefined,
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
    <form onSubmit={onSubmit} className="max-w-md space-y-3 text-sm">
      <label className="block">
        Name
        <input name="name" required defaultValue={name} className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Email
        <input name="email" type="email" required defaultValue={email} className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Phone
        <input name="phone" defaultValue={phone} className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Current password
        <input name="currentPassword" type="password" className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        New password
        <input name="newPassword" type="password" minLength={8} className="mt-1 w-full border px-2 py-1" />
      </label>
      {error ? <p className="text-red-600">{error}</p> : null}
      {ok ? <p>Saved.</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        Save
      </button>
    </form>
  );
}
