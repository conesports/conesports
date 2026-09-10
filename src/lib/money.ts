export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function variantSku(slug: string, size: string, color: string) {
  const parts = [slug, color, size]
    .map((p) => slugify(p) || "x")
    .join("-");
  return parts.slice(0, 120);
}

export function clampDiscountPercent(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function effectivePriceKobo(listKobo: number, discountPercent = 0) {
  const pct = clampDiscountPercent(discountPercent);
  if (!Number.isFinite(listKobo) || listKobo <= 0) return 0;
  if (pct <= 0) return Math.round(listKobo);
  if (pct >= 100) return 0;
  return Math.round((listKobo * (100 - pct)) / 100);
}

export function nairaToKobo(naira: unknown) {
  const n = typeof naira === "number" ? naira : Number(naira);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export function koboToNaira(kobo: number) {
  return kobo / 100;
}

export function formatNgn(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatMoney(amount: number, currency: string) {
  return currency.toLowerCase() === "usd" ? formatUsd(amount) : formatNgn(amount);
}

export function koboToUsdCents(kobo: number, ngnPerUsd: number) {
  if (ngnPerUsd <= 0) return 0;
  return Math.round((kobo / 100 / ngnPerUsd) * 100);
}

export function appUrl() {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
