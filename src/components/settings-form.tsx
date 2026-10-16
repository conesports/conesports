"use client";

import { useEffect, useState } from "react";

type SettingRow = {
  key: string;
  label: string;
  group: string;
  isSecret: boolean;
  value: string;
  displayValue: string;
  hasValue: boolean;
};

export function SettingsForm({ group = "payments" }: { group?: string }) {
  const [items, setItems] = useState<SettingRow[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: { items?: SettingRow[]; error?: string }) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const rows = data.items ?? [];
        setItems(rows);
        setValues(
          Object.fromEntries(rows.map((row) => [row.key, row.isSecret ? "" : row.value])),
        );
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: values }),
    });
    const data = (await res.json()) as { items?: SettingRow[]; error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    const rows = data.items ?? [];
    setItems(rows);
    setValues(
      Object.fromEntries(rows.map((row) => [row.key, row.isSecret ? "" : row.value])),
    );
  }

  const rows = items.filter((i) => i.group === group);
  const isUrlSetting = (key: string) => key.endsWith("_url");

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 text-sm">
      {rows.map((row) => (
        <label key={row.key} className="block">
          {row.label}
          {row.isSecret && row.hasValue ? (
            <span className="ml-2 text-zinc-500">{row.displayValue}</span>
          ) : null}
          <input
            className="mt-1 w-full border px-2 py-1"
            type={row.isSecret ? "password" : isUrlSetting(row.key) ? "url" : "text"}
            inputMode={isUrlSetting(row.key) ? "url" : undefined}
            autoComplete={isUrlSetting(row.key) ? "url" : undefined}
            value={values[row.key] ?? ""}
            placeholder={
              row.isSecret && row.hasValue
                ? "Leave blank to keep"
                : row.key === "social_facebook_url"
                  ? "https://facebook.com/…"
                  : row.key === "social_instagram_url"
                    ? "https://instagram.com/…"
                    : row.key === "social_tiktok_url"
                      ? "https://tiktok.com/@…"
                      : ""
            }
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [row.key]: e.target.value }))
            }
          />
        </label>
      ))}
      {error ? <p className="text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="border px-3 py-1">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
