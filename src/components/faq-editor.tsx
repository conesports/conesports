"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/faq";

export function FaqEditor({ initial }: { initial: FaqItem[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = (await res.json()) as { error?: string; items?: FaqItem[] };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (data.items) setItems(data.items);
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4 text-sm">
      {items.map((item, i) => (
        <div key={i} className="space-y-2 border p-3">
          <input
            className="w-full border px-2 py-1"
            value={item.question}
            placeholder="Question"
            onChange={(e) =>
              setItems((prev) =>
                prev.map((row, idx) => (idx === i ? { ...row, question: e.target.value } : row)),
              )
            }
          />
          <textarea
            className="w-full border px-2 py-1"
            rows={3}
            value={item.answer}
            placeholder="Answer"
            onChange={(e) =>
              setItems((prev) =>
                prev.map((row, idx) => (idx === i ? { ...row, answer: e.target.value } : row)),
              )
            }
          />
          <button
            type="button"
            className="underline"
            onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="underline"
        onClick={() => setItems((prev) => [...prev, { question: "", answer: "" }])}
      >
        Add question
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
      <div>
        <button type="submit" disabled={pending} className="border px-3 py-1">
          {pending ? "Saving…" : "Save FAQ"}
        </button>
      </div>
    </form>
  );
}
