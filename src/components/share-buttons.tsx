"use client";

import { useState } from "react";

export function ShareButtons({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <p className="text-xs font-bold tracking-[0.14em] uppercase">Share</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center border border-zinc-300 px-3 text-xs font-medium tracking-wide uppercase transition hover:border-black hover:bg-black hover:text-white"
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-9 items-center border border-zinc-300 px-3 text-xs font-medium tracking-wide uppercase transition hover:border-black hover:bg-black hover:text-white"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
