"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, koboToNaira } from "@/lib/money";

type Category = { id: string; name: string };
type VariantRow = { id?: string; size: string; color: string; stock: number };

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  priceUSD: number | null;
  discountPercent: number;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  priceConfirmed: boolean;
  categoryIds: string[];
  variants: VariantRow[];
};

export function ProductForm({
  categories,
  productId,
  initial,
}: {
  categories: Category[];
  productId?: string;
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial ? String(koboToNaira(initial.price)) : "",
  );
  const [priceUSD, setPriceUSD] = useState(
    initial?.priceUSD != null ? String(initial.priceUSD) : "",
  );
  const [discountPercent, setDiscountPercent] = useState(
    String(initial?.discountPercent ?? 0),
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [bestSeller, setBestSeller] = useState(initial?.bestSeller ?? false);
  const [priceConfirmed, setPriceConfirmed] = useState(
    initial?.priceConfirmed ?? false,
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categoryIds ?? [],
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants?.length
      ? initial.variants
      : [{ size: "", color: "", stock: 0 }],
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const autoSlug = useMemo(() => slugify(name), [name]);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("context", "product");
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? "Upload failed");
    }
    setImages((prev) => [...prev, data.url!]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const payload = {
      name,
      slug: slug || autoSlug,
      description,
      price: Number(price) || 0,
      priceUSD: priceUSD === "" ? null : Number(priceUSD),
      discountPercent: Number(discountPercent) || 0,
      images,
      featured,
      bestSeller,
      priceConfirmed,
      categoryIds,
      variants: variants.filter((v) => v.size && v.color),
    };

    const res = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <label className="block text-sm">
        Name
        <input
          className="mt-1 w-full border px-2 py-1"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Slug
        <input
          className="mt-1 w-full border px-2 py-1"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
        />
      </label>
      <label className="block text-sm">
        Description
        <textarea
          className="mt-1 w-full border px-2 py-1"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="grid grid-cols-3 gap-3">
        <label className="block text-sm">
          Price (NGN)
          <input
            className="mt-1 w-full border px-2 py-1"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Price USD
          <input
            className="mt-1 w-full border px-2 py-1"
            type="number"
            min="0"
            step="0.01"
            value={priceUSD}
            onChange={(e) => setPriceUSD(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Discount %
          <input
            className="mt-1 w-full border px-2 py-1"
            type="number"
            min="0"
            max="100"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </label>
      </div>
      <fieldset className="space-y-1 text-sm">
        <legend>Categories</legend>
        {categories.map((c) => (
          <label key={c.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={categoryIds.includes(c.id)}
              onChange={(e) => {
                setCategoryIds((prev) =>
                  e.target.checked
                    ? [...prev, c.id]
                    : prev.filter((id) => id !== c.id),
                );
              }}
            />
            {c.name}
          </label>
        ))}
      </fieldset>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => setBestSeller(e.target.checked)}
          />
          Best seller
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={priceConfirmed}
            onChange={(e) => setPriceConfirmed(e.target.checked)}
          />
          Price confirmed
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Images</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await uploadImage(file);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            }
            e.target.value = "";
          }}
        />
        <ul className="space-y-1">
          {images.map((url, index) => (
            <li
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex == null || dragIndex === index) return;
                setImages((prev) => {
                  const next = [...prev];
                  const [moved] = next.splice(dragIndex, 1);
                  next.splice(index, 0, moved);
                  return next;
                });
                setDragIndex(null);
              }}
              className="flex items-center gap-2 border px-2 py-1 text-xs"
            >
              <span>⋮⋮</span>
              <span className="truncate">{url}</span>
              <button
                type="button"
                className="ml-auto underline"
                onClick={() =>
                  setImages((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        {variants.map((row, index) => (
          <div key={index} className="grid grid-cols-4 gap-2">
            <input
              className="border px-2 py-1 text-sm"
              placeholder="Size"
              value={row.size}
              onChange={(e) =>
                setVariants((prev) =>
                  prev.map((v, i) =>
                    i === index ? { ...v, size: e.target.value } : v,
                  ),
                )
              }
            />
            <input
              className="border px-2 py-1 text-sm"
              placeholder="Color"
              value={row.color}
              onChange={(e) =>
                setVariants((prev) =>
                  prev.map((v, i) =>
                    i === index ? { ...v, color: e.target.value } : v,
                  ),
                )
              }
            />
            <input
              className="border px-2 py-1 text-sm"
              type="number"
              min="0"
              placeholder="Stock"
              value={row.stock}
              onChange={(e) =>
                setVariants((prev) =>
                  prev.map((v, i) =>
                    i === index
                      ? { ...v, stock: Number(e.target.value) || 0 }
                      : v,
                  ),
                )
              }
            />
            <button
              type="button"
              className="text-sm underline"
              onClick={() =>
                setVariants((prev) => prev.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm underline"
          onClick={() =>
            setVariants((prev) => [...prev, { size: "", color: "", stock: 0 }])
          }
        >
          Add variant
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="border px-3 py-1.5 text-sm"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
