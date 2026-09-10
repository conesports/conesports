"use client";

import Link from "next/link";
import Image from "next/image";
import type { HomepageHero } from "@/lib/homepage-content";

function splitHeading(heading: string) {
  const parts = heading
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [heading];
}

function splitScriptPhrase(line: string) {
  const match = line.match(/^(.*?)(\bthe\s+[^.]+\.?)$/i);
  if (match?.[1]?.trim() && match[2]) {
    return { lead: match[1].trim(), script: match[2].trim() };
  }
  return { lead: line, script: "" };
}

const TICKER = [
  "Football",
  "Running",
  "Training",
  "Basketball",
  "5-a-side",
  "Sunday league",
  "Lagos",
  "Abuja",
  "Port Harcourt",
];

export function HomeHero({ hero }: { hero: HomepageHero }) {
  const lines = splitHeading(hero.heading);

  return (
    <section className="hero-stage relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/hero-bg.png"
        alt="ConeSports match kit, trainer, and bottle"
        fill
        priority
        sizes="100vw"
        className="hero-zoom object-cover object-[78%_center] md:object-[72%_center]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10 md:via-black/55 md:to-transparent" />
      <div className="hero-glow pointer-events-none absolute -left-24 top-1/4 h-[60%] w-[55%] rounded-full" />
      <div className="hero-grain pointer-events-none absolute inset-0" />

      <div className="relative flex min-h-[100svh] flex-col justify-center px-4 pb-28 pt-24 lg:px-10">
        <p className="hero-rise text-[11px] font-bold tracking-[0.28em] text-white/70 uppercase">
          ConeSports · Nigeria
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight uppercase sm:text-6xl lg:text-7xl xl:text-8xl">
          {lines.map((line, i) => {
            const phrase = i === 0 ? splitScriptPhrase(line) : { lead: line, script: "" };
            return (
              <span
                key={line}
                className={`hero-rise block ${i === 1 ? "mt-1 text-white/90" : ""}`}
                style={{ animationDelay: `${180 + i * 140}ms` }}
              >
                {phrase.lead}
                {phrase.script ? (
                  <span className="hero-script ml-[0.2em] inline-block align-baseline text-[1.35em] text-white sm:ml-[0.28em] sm:text-[1.28em]">
                    {phrase.script.replace(/\.$/, "")}
                  </span>
                ) : null}
              </span>
            );
          })}
        </h1>
        {hero.body ? (
          <p
            className="hero-rise mt-6 max-w-xl text-base text-white/80 md:text-lg"
            style={{ animationDelay: "480ms" }}
          >
            {hero.body}
          </p>
        ) : null}

        <div
          className="hero-rise mt-8 flex flex-wrap gap-3"
          style={{ animationDelay: "620ms" }}
        >
          {hero.ctaLabel ? (
            <Link href={hero.ctaHref} className="btn-outline">
              {hero.ctaLabel}
            </Link>
          ) : null}
          {hero.ctaSecondaryLabel ? (
            <Link href={hero.ctaSecondaryHref} className="btn-solid">
              {hero.ctaSecondaryLabel}
            </Link>
          ) : null}
          <Link href="/sports/football" className="btn-ghost">
            Shop football
          </Link>
        </div>

        <ul
          className="hero-rise mt-10 flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-bold tracking-[0.16em] text-white/55 uppercase"
          style={{ animationDelay: "760ms" }}
        >
          <li>Ships nationwide</li>
          <li>Pay with Paystack</li>
          <li>Priced in naira</li>
        </ul>
      </div>

      <div className="absolute right-0 bottom-0 left-0 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="hero-marquee flex overflow-hidden py-3 text-[11px] font-bold tracking-[0.22em] whitespace-nowrap uppercase">
          <div className="hero-marquee-track flex shrink-0">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={`${item}-${i}`} className="px-6 text-white/70">
                {item}
                <span className="ml-6 text-[#e07a3d]">/</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
