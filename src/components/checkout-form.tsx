"use client";

import { useEffect, useState } from "react";
import { useCartStore, cartSubtotal } from "@/lib/store/cart";
import { formatNgn, formatUsd } from "@/lib/money";

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  isDefault: boolean;
};

type Quote = {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  gateway: "paystack" | "flutterwave";
  isFreeShipping: boolean;
  chargeUsdCents: number;
  error?: string;
};

export function CheckoutForm({
  email,
  name,
  addresses,
}: {
  email?: string | null;
  name?: string | null;
  addresses: Address[];
}) {
  const items = useCartStore((s) => s.items);
  const setGuestContact = useCartStore((s) => s.setGuestContact);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [country, setCountry] = useState(addresses[0]?.country ?? "NG");
  const [discountCode, setDiscountCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  useEffect(() => {
    if (!items.length) return;
    const t = setTimeout(() => {
      fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          country,
          discountCode: discountCode || undefined,
        }),
      })
        .then((r) => r.json())
        .then((data: Quote) => setQuote(data.error ? null : data));
    }, 300);
    return () => clearTimeout(t);
  }, [items, country, discountCode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/checkout/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        discountCode: discountCode || undefined,
        shipping: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          line1: String(form.get("line1") ?? ""),
          line2: String(form.get("line2") ?? ""),
          city: String(form.get("city") ?? ""),
          state: String(form.get("state") ?? ""),
          country: String(form.get("country") ?? ""),
          postalCode: String(form.get("postalCode") ?? ""),
          saveAddress: form.get("saveAddress") === "on",
        },
      }),
    });
    const data = (await res.json()) as {
      error?: string;
      authorizationUrl?: string;
    };
    if (!res.ok || !data.authorizationUrl) {
      setPending(false);
      setError(data.error ?? "Unable to start checkout");
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  if (!items.length) {
    return <p>Your cart is empty.</p>;
  }

  const gateway = quote?.gateway ?? (country.toUpperCase() === "NG" ? "paystack" : "flutterwave");

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3 text-sm">
        <h2 className="font-medium">Shipping</h2>
        <label className="block">
          Name
          <input name="name" required defaultValue={name ?? ""} className="mt-1 w-full border px-2 py-1" />
        </label>
        <label className="block">
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue={email ?? ""}
            onBlur={(e) => setGuestContact(e.target.value)}
            className="mt-1 w-full border px-2 py-1"
          />
        </label>
        <label className="block">
          Phone
          <input
            name="phone"
            onBlur={(e) =>
              setGuestContact(
                String((e.currentTarget.form?.elements.namedItem("email") as HTMLInputElement | null)?.value ?? ""),
                e.target.value,
              )
            }
            className="mt-1 w-full border px-2 py-1"
          />
        </label>
        <label className="block">
          Address
          <input name="line1" required defaultValue={defaultAddress?.line1 ?? ""} className="mt-1 w-full border px-2 py-1" />
        </label>
        <label className="block">
          Address line 2
          <input name="line2" defaultValue={defaultAddress?.line2 ?? ""} className="mt-1 w-full border px-2 py-1" />
        </label>
        <label className="block">
          City
          <input name="city" required defaultValue={defaultAddress?.city ?? ""} className="mt-1 w-full border px-2 py-1" />
        </label>
        <label className="block">
          State
          <input name="state" defaultValue={defaultAddress?.state ?? ""} className="mt-1 w-full border px-2 py-1" />
        </label>
        <label className="block">
          Country
          <input
            name="country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 w-full border px-2 py-1"
          />
        </label>
        <label className="block">
          Postal code
          <input name="postalCode" defaultValue={defaultAddress?.postalCode ?? ""} className="mt-1 w-full border px-2 py-1" />
        </label>
        {email ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" name="saveAddress" />
            Save this address
          </label>
        ) : null}
      </div>
      <div className="text-sm">
        <h2 className="mb-2 font-medium">Order summary</h2>
        <ul className="mb-3 space-y-1">
          {items.map((item) => (
            <li key={item.variantId}>
              {item.name} × {item.quantity} — {formatNgn(item.price * item.quantity)}
            </li>
          ))}
        </ul>
        <label className="mb-3 block">
          Discount code
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="mt-1 w-full border px-2 py-1"
          />
        </label>
        <p>Subtotal {quote ? formatNgn(quote.subtotal) : formatNgn(cartSubtotal(items))}</p>
        <p>
          Shipping{" "}
          {quote
            ? quote.isFreeShipping
              ? "Free"
              : formatNgn(quote.shippingCost)
            : "calculated on the server"}
        </p>
        {quote?.discountAmount ? <p>Discount −{formatNgn(quote.discountAmount)}</p> : null}
        <p className="mt-2 font-medium">
          Total {quote ? formatNgn(quote.total) : formatNgn(cartSubtotal(items))}
          {quote?.gateway === "flutterwave" ? ` (${formatUsd(quote.chargeUsdCents)})` : ""}
        </p>
        <p className="mt-1 text-zinc-600">
          Paying with {gateway === "paystack" ? "Paystack (NGN)" : "Flutterwave (USD)"}
        </p>
        {error ? <p className="mt-2 text-red-600">{error}</p> : null}
        <button type="submit" disabled={pending} className="mt-4 border px-3 py-2">
          {pending ? "Redirecting…" : gateway === "paystack" ? "Pay with Paystack" : "Pay with Flutterwave"}
        </button>
      </div>
    </form>
  );
}
