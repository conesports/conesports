"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBackLink, AdminCard } from "@/components/admin-page-header";
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
    <form onSubmit={onSubmit} className="space-y-5">
      <AdminBackLink href="/admin/products" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-5">
          <AdminCard title="Details">
            <div className="space-y-4">
              <label className="admin-field">
                Name
                <input
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  required
                />
              </label>
              <label className="admin-field">
                Slug
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  required
                />
              </label>
              <label className="admin-field">
                Description
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="admin-field">
                Price (NGN)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label className="admin-field">
                Price USD
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                />
              </label>
              <label className="admin-field">
                Discount %
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Categories">
            {categories.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm"
                  >
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
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No categories yet.</p>
            )}
          </AdminCard>

          <AdminCard title="Variants">
            <div className="space-y-3">
              {variants.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[1fr_1fr_6rem_auto]"
                >
                  <input
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
                    className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-black"
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
                className="rounded-xl border border-dashed border-zinc-300 px-3 py-2.5 text-sm font-semibold text-zinc-600 transition hover:border-zinc-400 hover:text-black"
                onClick={() =>
                  setVariants((prev) => [...prev, { size: "", color: "", stock: 0 }])
                }
              >
                Add variant
              </button>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-5">
          <AdminCard title="Images">
            <div className="space-y-4">
              {images[0] ? (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[0]}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ) : null}

              <label className="admin-upload cursor-pointer">
                <span>
                  {images.length ? "Add another image" : "Upload product image"}
                  <br />
                  <span className="text-xs text-zinc-400">JPEG, PNG, WebP, GIF</span>
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
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
              </label>

              {images.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2">
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
                      className="group relative overflow-hidden rounded-xl border border-zinc-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="aspect-square w-full object-cover" />
                      <button
                        type="button"
                        className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-[10px] font-bold tracking-wide text-white uppercase opacity-0 transition group-hover:opacity-100"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-zinc-500">Drag thumbnails to reorder. First image is the cover.</p>
            </div>
          </AdminCard>

          <AdminCard title="Visibility">
            <div className="space-y-2">
              {[
                {
                  checked: featured,
                  onChange: setFeatured,
                  label: "Featured on homepage",
                },
                {
                  checked: bestSeller,
                  onChange: setBestSeller,
                  label: "Best seller",
                },
                {
                  checked: priceConfirmed,
                  onChange: setPriceConfirmed,
                  label: "Price confirmed",
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <button
          type="button"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-500 transition hover:text-black"
          onClick={() => router.push("/admin/products")}
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={pending}
          className="btn-solid rounded-xl disabled:opacity-60"
        >
          {pending ? "Saving…" : productId ? "Save product" : "Add product"}
        </button>
      </div>
    </form>
  );
}
