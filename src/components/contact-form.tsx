"use client";

import { useState } from "react";

export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setOk(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        subject: form.get("subject"),
        body: form.get("body"),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send message");
      return;
    }
    setOk(true);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3 text-sm">
      <label className="block">
        Name
        <input name="name" required className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Email
        <input name="email" type="email" required className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Phone
        <input name="phone" className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Subject
        <input name="subject" className="mt-1 w-full border px-2 py-1" />
      </label>
      <label className="block">
        Message
        <textarea name="body" required minLength={10} rows={5} className="mt-1 w-full border px-2 py-1" />
      </label>
      {error ? <p className="text-red-600">{error}</p> : null}
      {ok ? <p>Message sent.</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
