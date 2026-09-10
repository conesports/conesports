"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/rich-text-editor";

export function SitePageEditor({
  slug,
  title,
  metaDescription,
  bodyHtml,
}: {
  slug: string;
  title: string;
  metaDescription: string;
  bodyHtml: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ title, metaDescription, bodyHtml });
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/admin/site-pages/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    router.refresh();
  }

  async function restore() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/admin/site-pages/${slug}`, { method: "DELETE" });
    const data = (await res.json()) as {
      error?: string;
      page?: { title: string; metaDescription: string; bodyHtml: string };
    };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Restore failed");
      return;
    }
    if (data.page) {
      setValues({
        title: data.page.title,
        metaDescription: data.page.metaDescription,
        bodyHtml: data.page.bodyHtml,
      });
      setEditorKey((n) => n + 1);
    }
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4 text-sm">
      <label className="block">
        SEO title
        <input
          className="mt-1 w-full border px-2 py-1"
          value={values.title}
          onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
          required
        />
      </label>
      <label className="block">
        Meta description
        <textarea
          className="mt-1 w-full border px-2 py-1"
          rows={2}
          value={values.metaDescription}
          onChange={(e) => setValues((p) => ({ ...p, metaDescription: e.target.value }))}
        />
      </label>
      <div>
        <p className="mb-1">Body</p>
        <RichTextEditor
          key={editorKey}
          value={values.bodyHtml}
          onChange={(bodyHtml) => setValues((p) => ({ ...p, bodyHtml }))}
        />
      </div>
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="border px-3 py-1">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" disabled={pending} className="border px-3 py-1" onClick={restore}>
          Restore default
        </button>
      </div>
    </form>
  );
}
