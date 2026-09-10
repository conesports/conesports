"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rating: Number(form.get("rating")),
        title: form.get("title"),
        body: form.get("body"),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit review");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-md space-y-2 text-sm">
      <label className="block">
        Rating
        <select name="rating" required className="mt-1 border px-2 py-1">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <input name="title" placeholder="Title" className="w-full border px-2 py-1" />
      <textarea name="body" required minLength={3} rows={4} className="w-full border px-2 py-1" />
      {error ? <p className="text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        Submit review
      </button>
    </form>
  );
}
