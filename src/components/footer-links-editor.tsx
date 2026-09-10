"use client";

import { useState } from "react";
import type { SiteLink } from "@/lib/site-links";

export function FooterLinksEditor({
  initial,
}: {
  initial: { quickLinks: SiteLink[]; policyLinks: SiteLink[] };
}) {
  const [quickLinks, setQuickLinks] = useState(initial.quickLinks);
  const [policyLinks, setPolicyLinks] = useState(initial.policyLinks);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/site-links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quickLinks, policyLinks }),
    });
    const data = (await res.json()) as {
      error?: string;
      quickLinks?: SiteLink[];
      policyLinks?: SiteLink[];
    };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (data.quickLinks) setQuickLinks(data.quickLinks);
    if (data.policyLinks) setPolicyLinks(data.policyLinks);
  }

  return (
    <form onSubmit={save} className="space-y-8 text-sm">
      <LinkGroup title="Quick links" items={quickLinks} onChange={setQuickLinks} />
      <LinkGroup title="Policy links" items={policyLinks} onChange={setPolicyLinks} />
      {error ? <p className="text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        {pending ? "Saving…" : "Save links"}
      </button>
    </form>
  );
}

function LinkGroup({
  title,
  items,
  onChange,
}: {
  title: string;
  items: SiteLink[];
  onChange: (items: SiteLink[]) => void;
}) {
  return (
    <section className="max-w-xl space-y-2">
      <h2 className="font-medium">{title}</h2>
      {items.map((item, i) => (
        <div key={`${title}-${i}`} className="flex gap-2">
          <input
            className="flex-1 border px-2 py-1"
            value={item.label}
            placeholder="Label"
            onChange={(e) =>
              onChange(items.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row)))
            }
          />
          <input
            className="flex-1 border px-2 py-1"
            value={item.href}
            placeholder="/page"
            onChange={(e) =>
              onChange(items.map((row, idx) => (idx === i ? { ...row, href: e.target.value } : row)))
            }
          />
          <button
            type="button"
            className="underline"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="underline"
        onClick={() => onChange([...items, { label: "", href: "" }])}
      >
        Add link
      </button>
    </section>
  );
}
