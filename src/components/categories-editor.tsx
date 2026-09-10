"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/money";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  intro: string;
  sortOrder: number;
  productCount: number;
};

export function CategoriesEditor({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [intro, setIntro] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || slugify(name), intro }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    setName("");
    setSlug("");
    setIntro("");
    router.refresh();
  }

  async function save(row: CategoryRow) {
    setError(null);
    const res = await fetch(`/api/admin/categories/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: row.name,
        slug: row.slug,
        intro: row.intro,
        sortOrder: row.sortOrder,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error ?? "Save failed");
    else router.refresh();
  }

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error ?? "Delete failed");
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="flex flex-wrap gap-2 text-sm">
        <input
          className="border px-2 py-1"
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          required
        />
        <input
          className="border px-2 py-1"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <input
          className="min-w-48 flex-1 border px-2 py-1"
          placeholder="Intro"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        />
        <button type="submit" className="border px-3 py-1">
          Add
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b py-2">Name</th>
            <th className="border-b py-2">Slug</th>
            <th className="border-b py-2">Intro</th>
            <th className="border-b py-2">Sort</th>
            <th className="border-b py-2">Products</th>
            <th className="border-b py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border-b py-2">
                <input
                  className="w-full border px-1 py-0.5"
                  value={row.name}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, name: e.target.value } : r,
                      ),
                    )
                  }
                />
              </td>
              <td className="border-b py-2">
                <input
                  className="w-full border px-1 py-0.5"
                  value={row.slug}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, slug: e.target.value } : r,
                      ),
                    )
                  }
                />
              </td>
              <td className="border-b py-2">
                <input
                  className="w-full border px-1 py-0.5"
                  value={row.intro}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, intro: e.target.value } : r,
                      ),
                    )
                  }
                />
              </td>
              <td className="border-b py-2">
                <input
                  className="w-16 border px-1 py-0.5"
                  type="number"
                  value={row.sortOrder}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id
                          ? { ...r, sortOrder: Number(e.target.value) || 0 }
                          : r,
                      ),
                    )
                  }
                />
              </td>
              <td className="border-b py-2">{row.productCount}</td>
              <td className="border-b py-2">
                <button type="button" className="underline" onClick={() => save(row)}>
                  Save
                </button>{" "}
                <button type="button" className="underline" onClick={() => remove(row.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
