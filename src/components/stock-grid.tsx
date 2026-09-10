"use client";

import { useMemo, useState } from "react";

type Variant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
};

type ProductRow = {
  id: string;
  name: string;
  variants: Variant[];
};

export function StockGrid({ products }: { products: ProductRow[] }) {
  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      for (const v of p.variants) map[v.id] = v.stock;
    }
    return map;
  }, [products]);
  const [stock, setStock] = useState<Record<string, number>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setError(null);
    setOk(false);
    const updates = Object.entries(stock).map(([variantId, value]) => ({
      variantId,
      stock: value,
    }));
    if (!updates.length) {
      setPending(false);
      setError("No variants to update");
      return;
    }
    const res = await fetch("/api/admin/products/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
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
    <div className="space-y-4 text-sm">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b py-2">Product</th>
            <th className="border-b py-2">Variant</th>
            <th className="border-b py-2">SKU</th>
            <th className="border-b py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.flatMap((p) =>
            p.variants.map((v) => (
              <tr key={v.id}>
                <td className="border-b py-2">{p.name}</td>
                <td className="border-b py-2">
                  {v.size}
                  {v.color ? ` / ${v.color}` : ""}
                </td>
                <td className="border-b py-2">{v.sku}</td>
                <td className="border-b py-2">
                  <input
                    type="number"
                    min={0}
                    className="w-24 border px-2 py-1"
                    value={stock[v.id] ?? 0}
                    onChange={(e) =>
                      setStock((prev) => ({
                        ...prev,
                        [v.id]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                  />
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      {error ? <p className="text-red-600">{error}</p> : null}
      {ok ? <p>Saved.</p> : null}
      <button type="button" disabled={pending} className="border px-3 py-1" onClick={save}>
        {pending ? "Saving…" : "Save stock"}
      </button>
    </div>
  );
}
