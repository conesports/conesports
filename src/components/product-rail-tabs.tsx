"use client";

import { useMemo, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/product-card";

type Tab = {
  id: string;
  label: string;
  products: ProductCardData[];
};

export function ProductRailTabs({
  heading,
  tabs,
}: {
  heading: string;
  tabs: Tab[];
}) {
  const visible = useMemo(
    () => tabs.filter((tab) => tab.products.length > 0),
    [tabs],
  );
  const [active, setActive] = useState(visible[0]?.id ?? "");
  const current = visible.find((tab) => tab.id === active) ?? visible[0];

  if (!current) return null;

  return (
    <section className="px-4 py-12 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight uppercase md:text-3xl">
          {heading}
        </h2>
        {visible.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {visible.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2 text-xs font-bold tracking-[0.12em] uppercase ${
                  tab.id === current.id
                    ? "bg-black text-white"
                    : "bg-[#f5f5f5] text-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {current.products.slice(0, 4).map((product, i) => (
          <ProductCard key={product.id ?? product.slug} product={product} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
