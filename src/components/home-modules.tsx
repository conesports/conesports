import Link from "next/link";
import Image from "next/image";
import type {
  HomepageCampaign,
  HomepageLookbook,
  HomepageQuotes,
  HomepageTileRow,
} from "@/lib/homepage-content";
import { BANNER, bannerForHref, bannerForStory } from "@/lib/banners";

export function ShopBySport({ section }: { section: HomepageTileRow }) {
  if (!section.enabled || !section.tiles.length) return null;
  const positions = ["object-[20%_center]", "object-[70%_center]", "object-[40%_center]", "object-[80%_center]"];

  return (
    <section className="px-4 py-14 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold tracking-tight uppercase md:text-3xl">
        {section.heading}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {section.tiles.map((tile, i) => (
          <Link
            key={tile.href + tile.heading}
            href={tile.href}
            className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden bg-black p-6 text-white md:min-h-[340px]"
          >
            <Image
              src={bannerForHref(tile.href)}
              alt=""
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`object-cover opacity-60 transition duration-300 group-hover:scale-105 group-hover:opacity-70 ${positions[i % positions.length]}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="relative">
              <h3 className="text-xl font-bold tracking-tight uppercase">{tile.heading}</h3>
              <p className="mt-2 text-sm text-white/80">{tile.body}</p>
              <span className="mt-4 inline-block text-xs font-bold tracking-[0.14em] uppercase">
                {tile.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CampaignBanner({ section }: { section: HomepageCampaign }) {
  if (!section.enabled) return null;
  return (
    <section className="relative min-h-[380px] overflow-hidden bg-black text-white md:min-h-[460px]">
      <Image
        src={bannerForHref(section.ctaHref) || BANNER.school}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[60%_center] opacity-50"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative flex min-h-[380px] flex-col items-center justify-center px-4 py-16 text-center md:min-h-[460px] lg:px-8">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/70">
          This season
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight uppercase md:text-5xl">
          {section.heading}
        </h2>
        {section.body ? (
          <p className="mt-4 max-w-xl text-sm text-white/85 md:text-base">{section.body}</p>
        ) : null}
        {section.ctaLabel ? (
          <p className="mt-8">
            <Link href={section.ctaHref} className="btn-solid">
              {section.ctaLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function LookbookPair({
  section,
  tones = ["dark", "warm"],
}: {
  section: HomepageLookbook;
  tones?: Array<"dark" | "warm" | "club">;
}) {
  if (!section.enabled) return null;
  return (
    <section className="grid md:grid-cols-2">
      <LookbookTile
        heading={section.leftHeading}
        body={section.leftBody}
        cta={section.leftCta}
        href={section.leftHref}
        image={bannerForHref(section.leftHref)}
        tone={tones[0] ?? "dark"}
      />
      <LookbookTile
        heading={section.rightHeading}
        body={section.rightBody}
        cta={section.rightCta}
        href={section.rightHref}
        image={bannerForHref(section.rightHref)}
        tone={tones[1] ?? "warm"}
      />
    </section>
  );
}

export function LookbookTile({
  heading,
  body,
  cta,
  href,
  image,
  tone,
}: {
  heading: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  tone: "dark" | "warm" | "club";
}) {
  const bg =
    tone === "warm" ? "bg-[#1c1410]" : tone === "club" ? "bg-[var(--club)]" : "bg-[#111]";
  return (
    <div
      className={`relative flex min-h-[320px] flex-col justify-end overflow-hidden px-6 py-10 text-white md:min-h-[420px] md:px-10 ${bg}`}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="50vw"
        className={`object-cover opacity-40 ${tone === "warm" ? "object-[80%_center]" : "object-[30%_center]"}`}
      />
      <div className="relative">
        <h3 className="text-2xl font-bold tracking-tight uppercase md:text-3xl">{heading}</h3>
        {body ? <p className="mt-3 max-w-md text-sm text-white/75">{body}</p> : null}
        {cta ? (
          <p className="mt-6">
            <Link href={href} className="btn-outline">
              {cta}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function StoriesRow({ section }: { section: HomepageTileRow }) {
  if (!section.enabled || !section.tiles.length) return null;
  return (
    <section className="bg-[#f5f5f5] px-4 py-14 lg:px-8">
      <h2 className="mb-8 text-2xl font-bold tracking-tight uppercase md:text-3xl">
        {section.heading}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {section.tiles.map((tile, i) => (
          <Link key={tile.heading} href={tile.href} className="group block bg-white">
            <div className="relative h-48 overflow-hidden bg-zinc-200 md:h-56">
              <Image
                src={bannerForStory(tile.heading, i)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold tracking-tight uppercase">{tile.heading}</h3>
              <p className="mt-2 text-sm text-zinc-600">{tile.body}</p>
              <span className="mt-4 inline-block text-xs font-bold tracking-[0.14em] uppercase">
                {tile.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function QuotesRow({ section }: { section: HomepageQuotes }) {
  if (!section.enabled || !section.items.length) return null;
  return (
    <section className="px-4 py-16 lg:px-8">
      <h2 className="mb-10 text-center text-2xl font-bold tracking-tight uppercase md:text-3xl">
        {section.heading}
      </h2>
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        {section.items.map((item) => (
          <blockquote key={item.credit} className="text-center">
            <p className="text-lg font-medium tracking-tight text-zinc-900 md:text-xl">
              “{item.quote}”
            </p>
            <footer className="mt-4 text-[11px] font-bold tracking-[0.14em] text-zinc-500 uppercase">
              {item.credit}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
