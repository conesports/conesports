/** Shared size / color options for admin product variants. */

export const PRODUCT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One size",
] as const;

export type ProductColorOption = {
  name: string;
  hex: string;
};

export const PRODUCT_COLORS: ProductColorOption[] = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Bone", hex: "#e8e0d4" },
  { name: "Sand", hex: "#cbb89a" },
  { name: "Tan", hex: "#b08968" },
  { name: "Camel", hex: "#c19a6b" },
  { name: "Khaki", hex: "#a3926d" },
  { name: "Olive", hex: "#556b2f" },
  { name: "Forest", hex: "#1f3d2b" },
  { name: "Navy", hex: "#1a2744" },
  { name: "Charcoal", hex: "#36454f" },
  { name: "Grey", hex: "#8a8a8a" },
  { name: "Chroma", hex: "#2f6fed" },
  { name: "Home", hex: "#0b7a3e" },
  { name: "Away", hex: "#f2f2f2" },
  { name: "Classic", hex: "#f4f4f4" },
];

export function colorHex(name: string) {
  const match = PRODUCT_COLORS.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
  return match?.hex ?? "#d4d4d8";
}
