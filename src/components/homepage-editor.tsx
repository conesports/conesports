"use client";

import { useState } from "react";
import {
  HOMEPAGE_SECTION_IDS,
  HOMEPAGE_SECTION_LABELS,
  type HomepageContent,
  type HomepageSectionId,
} from "@/lib/homepage-content";

type Props = {
  initial: HomepageContent;
  overridden: Record<HomepageSectionId, boolean>;
};

export function HomepageEditor({ initial, overridden }: Props) {
  const [content, setContent] = useState(initial);
  const [flags, setFlags] = useState(overridden);
  const [open, setOpen] = useState<HomepageSectionId>("hero");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  function update<K extends HomepageSectionId>(id: K, data: HomepageContent[K]) {
    setContent((prev) => ({ ...prev, [id]: data }));
  }

  async function save(sectionId: HomepageSectionId) {
    setPending(`save-${sectionId}`);
    setError(null);
    const res = await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, data: content[sectionId] }),
    });
    const data = (await res.json()) as {
      error?: string;
      content?: HomepageContent;
      overridden?: Record<HomepageSectionId, boolean>;
    };
    setPending(null);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (data.content) setContent(data.content);
    if (data.overridden) setFlags(data.overridden);
  }

  async function restore(sectionId?: HomepageSectionId) {
    setPending(sectionId ? `restore-${sectionId}` : "restore-all");
    setError(null);
    const url = sectionId
      ? `/api/admin/homepage?section=${sectionId}`
      : "/api/admin/homepage";
    const res = await fetch(url, { method: "DELETE" });
    const data = (await res.json()) as {
      error?: string;
      content?: HomepageContent;
      overridden?: Record<HomepageSectionId, boolean>;
    };
    setPending(null);
    if (!res.ok) {
      setError(data.error ?? "Restore failed");
      return;
    }
    if (data.content) setContent(data.content);
    if (data.overridden) setFlags(data.overridden);
  }

  return (
    <div className="space-y-4 text-sm">
      <button
        type="button"
        className="border px-3 py-1"
        disabled={pending !== null}
        onClick={() => restore()}
      >
        {pending === "restore-all" ? "Restoring…" : "Restore all sections"}
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
      {HOMEPAGE_SECTION_IDS.map((id) => (
        <details
          key={id}
          open={open === id}
          onToggle={(e) => {
            if (e.currentTarget.open) setOpen(id);
          }}
          className="border p-3"
        >
          <summary className="cursor-pointer font-medium">
            {HOMEPAGE_SECTION_LABELS[id]}
            {flags[id] ? " (edited)" : ""}
          </summary>
          <div className="mt-3 space-y-3">
            <SectionFields
              id={id}
              data={content[id]}
              onChange={(data) => update(id, data)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="border px-3 py-1"
                disabled={pending !== null}
                onClick={() => save(id)}
              >
                {pending === `save-${id}` ? "Saving…" : "Save section"}
              </button>
              <button
                type="button"
                className="border px-3 py-1"
                disabled={pending !== null || !flags[id]}
                onClick={() => restore(id)}
              >
                {pending === `restore-${id}` ? "Restoring…" : "Restore this section"}
              </button>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function SectionFields({
  id,
  data,
  onChange,
}: {
  id: HomepageSectionId;
  data: HomepageContent[HomepageSectionId];
  onChange: (data: HomepageContent[HomepageSectionId]) => void;
}) {
  if (id === "promoBar") {
    const row = data as HomepageContent["promoBar"];
    return (
      <Field
        label="Bar text"
        value={row.text}
        onChange={(text) => onChange({ ...row, text })}
      />
    );
  }

  if (id === "hero") {
    const row = data as HomepageContent["hero"];
    return (
      <>
        <Field
          label="Heading"
          value={row.heading}
          onChange={(heading) => onChange({ ...row, heading })}
        />
        <Field
          label="Body"
          value={row.body}
          multiline
          onChange={(body) => onChange({ ...row, body })}
        />
        <Field
          label="Primary button"
          value={row.ctaLabel}
          onChange={(ctaLabel) => onChange({ ...row, ctaLabel })}
        />
        <Field
          label="Primary link"
          value={row.ctaHref}
          onChange={(ctaHref) => onChange({ ...row, ctaHref })}
        />
        <Field
          label="Secondary button"
          value={row.ctaSecondaryLabel}
          onChange={(ctaSecondaryLabel) => onChange({ ...row, ctaSecondaryLabel })}
        />
        <Field
          label="Secondary link"
          value={row.ctaSecondaryHref}
          onChange={(ctaSecondaryHref) => onChange({ ...row, ctaSecondaryHref })}
        />
      </>
    );
  }

  if (id === "shopBy" || id === "stories") {
    const row = data as HomepageContent["shopBy"];
    return (
      <>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => onChange({ ...row, enabled: e.target.checked })}
          />
          Show this section
        </label>
        <Field
          label="Heading"
          value={row.heading}
          onChange={(heading) => onChange({ ...row, heading })}
        />
        {row.tiles.map((tile, index) => (
          <div key={index} className="space-y-2 border-t pt-3">
            <p className="font-medium">Tile {index + 1}</p>
            <Field
              label="Heading"
              value={tile.heading}
              onChange={(heading) =>
                onChange({
                  ...row,
                  tiles: row.tiles.map((t, i) => (i === index ? { ...t, heading } : t)),
                })
              }
            />
            <Field
              label="Body"
              value={tile.body}
              multiline
              onChange={(body) =>
                onChange({
                  ...row,
                  tiles: row.tiles.map((t, i) => (i === index ? { ...t, body } : t)),
                })
              }
            />
            <Field
              label="Button"
              value={tile.cta}
              onChange={(cta) =>
                onChange({
                  ...row,
                  tiles: row.tiles.map((t, i) => (i === index ? { ...t, cta } : t)),
                })
              }
            />
            <Field
              label="Link"
              value={tile.href}
              onChange={(href) =>
                onChange({
                  ...row,
                  tiles: row.tiles.map((t, i) => (i === index ? { ...t, href } : t)),
                })
              }
            />
          </div>
        ))}
      </>
    );
  }

  if (id === "campaign") {
    const row = data as HomepageContent["campaign"];
    return (
      <>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => onChange({ ...row, enabled: e.target.checked })}
          />
          Show this section
        </label>
        <Field
          label="Heading"
          value={row.heading}
          onChange={(heading) => onChange({ ...row, heading })}
        />
        <Field
          label="Body"
          value={row.body}
          multiline
          onChange={(body) => onChange({ ...row, body })}
        />
        <Field
          label="Button label"
          value={row.ctaLabel}
          onChange={(ctaLabel) => onChange({ ...row, ctaLabel })}
        />
        <Field
          label="Button link"
          value={row.ctaHref}
          onChange={(ctaHref) => onChange({ ...row, ctaHref })}
        />
      </>
    );
  }

  if (id === "quotes") {
    const row = data as HomepageContent["quotes"];
    return (
      <>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => onChange({ ...row, enabled: e.target.checked })}
          />
          Show this section
        </label>
        <Field
          label="Heading"
          value={row.heading}
          onChange={(heading) => onChange({ ...row, heading })}
        />
        {row.items.map((item, index) => (
          <div key={index} className="space-y-2 border-t pt-3">
            <p className="font-medium">Quote {index + 1}</p>
            <Field
              label="Quote"
              value={item.quote}
              multiline
              onChange={(quote) =>
                onChange({
                  ...row,
                  items: row.items.map((q, i) => (i === index ? { ...q, quote } : q)),
                })
              }
            />
            <Field
              label="Credit"
              value={item.credit}
              onChange={(credit) =>
                onChange({
                  ...row,
                  items: row.items.map((q, i) => (i === index ? { ...q, credit } : q)),
                })
              }
            />
          </div>
        ))}
      </>
    );
  }

  if (id === "lookbook" || id === "split") {
    const row = data as HomepageContent["lookbook"];
    return (
      <>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => onChange({ ...row, enabled: e.target.checked })}
          />
          Show this section
        </label>
        <Field
          label="Left heading"
          value={row.leftHeading}
          onChange={(leftHeading) => onChange({ ...row, leftHeading })}
        />
        <Field
          label="Left body"
          value={row.leftBody}
          multiline
          onChange={(leftBody) => onChange({ ...row, leftBody })}
        />
        <Field
          label="Left button"
          value={row.leftCta}
          onChange={(leftCta) => onChange({ ...row, leftCta })}
        />
        <Field
          label="Left link"
          value={row.leftHref}
          onChange={(leftHref) => onChange({ ...row, leftHref })}
        />
        <Field
          label="Right heading"
          value={row.rightHeading}
          onChange={(rightHeading) => onChange({ ...row, rightHeading })}
        />
        <Field
          label="Right body"
          value={row.rightBody}
          multiline
          onChange={(rightBody) => onChange({ ...row, rightBody })}
        />
        <Field
          label="Right button"
          value={row.rightCta}
          onChange={(rightCta) => onChange({ ...row, rightCta })}
        />
        <Field
          label="Right link"
          value={row.rightHref}
          onChange={(rightHref) => onChange({ ...row, rightHref })}
        />
      </>
    );
  }

  if (id === "brand") {
    const row = data as HomepageContent["brand"];
    return (
      <>
        <Field
          label="Heading"
          value={row.heading}
          onChange={(heading) => onChange({ ...row, heading })}
        />
        <Field
          label="Body"
          value={row.body}
          multiline
          onChange={(body) => onChange({ ...row, body })}
        />
      </>
    );
  }

  if (id === "club") {
    const row = data as HomepageContent["club"];
    return (
      <>
        <Field
          label="Heading"
          value={row.heading}
          onChange={(heading) => onChange({ ...row, heading })}
        />
        <Field
          label="Body"
          value={row.body}
          multiline
          onChange={(body) => onChange({ ...row, body })}
        />
        <Field
          label="Button label"
          value={row.ctaLabel}
          onChange={(ctaLabel) => onChange({ ...row, ctaLabel })}
        />
        <Field
          label="Button link"
          value={row.ctaHref}
          onChange={(ctaHref) => onChange({ ...row, ctaHref })}
        />
      </>
    );
  }

  const row = data as HomepageContent["featured"];
  return (
    <>
      <Field
        label="Heading"
        value={row.heading}
        onChange={(heading) => onChange({ ...row, heading })}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={row.enabled}
          onChange={(e) => onChange({ ...row, enabled: e.target.checked })}
        />
        Show this section
      </label>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      {label}
      {multiline ? (
        <textarea
          className="mt-1 w-full border px-2 py-1"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="mt-1 w-full border px-2 py-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
