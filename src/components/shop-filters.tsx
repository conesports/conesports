import Link from "next/link";

export function ShopFilters({
  action,
  categories,
  sizes,
  colors,
  current,
}: {
  action: string;
  categories: { name: string; slug: string }[];
  sizes: string[];
  colors: string[];
  current: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    inStock?: string;
    sort?: string;
  };
}) {
  return (
    <form method="get" action={action} className="mb-6 flex flex-wrap gap-2 text-sm">
      {!action.includes("/shop/") ? (
        <select name="category" defaultValue={current.category ?? ""} className="border px-2 py-1">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}
      <input
        name="minPrice"
        type="number"
        min="0"
        placeholder="Min ₦"
        defaultValue={current.minPrice ?? ""}
        className="w-24 border px-2 py-1"
      />
      <input
        name="maxPrice"
        type="number"
        min="0"
        placeholder="Max ₦"
        defaultValue={current.maxPrice ?? ""}
        className="w-24 border px-2 py-1"
      />
      <select name="size" defaultValue={current.size ?? ""} className="border px-2 py-1">
        <option value="">Size</option>
        {sizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select name="color" defaultValue={current.color ?? ""} className="border px-2 py-1">
        <option value="">Color</option>
        {colors.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1">
        <input type="checkbox" name="inStock" value="1" defaultChecked={current.inStock === "1"} />
        In stock
      </label>
      <select name="sort" defaultValue={current.sort ?? "newest"} className="border px-2 py-1">
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low</option>
        <option value="price-desc">Price: high</option>
        <option value="popularity">Popularity</option>
      </select>
      <button type="submit" className="border px-2 py-1">
        Apply
      </button>
      <Link href={action} className="px-2 py-1">
        Reset
      </Link>
    </form>
  );
}
