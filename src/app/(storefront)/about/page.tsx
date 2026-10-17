import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "Learn more about ConeSports.",
  path: "/about",
  image: "/images/banners/five-aside.jpg",
});

const GALLERY = [
  {
    src: "/images/banners/football.jpg",
    alt: "Football training",
    caption: "Match day",
  },
  {
    src: "/images/banners/running.jpg",
    alt: "Running kit",
    caption: "Road & track",
  },
  {
    src: "/images/banners/training.jpg",
    alt: "Gym training",
    caption: "Session ready",
  },
  {
    src: "/images/banners/women.jpg",
    alt: "Women's kit",
    caption: "Women's kit",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <section className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-xs font-bold tracking-[0.16em] text-zinc-500 uppercase">
            ConeSports
          </p>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">
            About Us
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-600 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/shop"
              className="inline-flex bg-black px-4 py-2.5 text-xs font-bold tracking-[0.14em] text-white uppercase"
            >
              Shop the kit
            </Link>
            <Link
              href="/contact"
              className="inline-flex border border-zinc-300 px-4 py-2.5 text-xs font-bold tracking-[0.14em] uppercase"
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 md:aspect-[5/6]">
          <Image
            src="/images/banners/five-aside.jpg"
            alt="Athletes on a floodlit pitch"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="relative order-2 aspect-[16/11] overflow-hidden bg-zinc-100 md:order-1">
          <Image
            src="/images/banners/men.jpg"
            alt="Men's sportswear"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 space-y-4 md:order-2">
          <h2 className="text-2xl font-semibold">Our story</h2>
          <p className="text-sm leading-relaxed text-zinc-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            posuere erat a ante venenatis dapibus posuere velit aliquet. Cras
            mattis consectetur purus sit amet fermentum.
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">
            Aenean lacinia bibendum nulla sed consectetur. Nullam id dolor id
            nibh ultricies vehicula ut id elit. Donec ullamcorper nulla non metus
            auctor fringilla.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Built for heat",
            body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
          },
          {
            title: "Priced in naira",
            body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
          },
          {
            title: "Ships nationwide",
            body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
          },
        ].map((item) => (
          <div key={item.title} className="border-t border-black pt-5">
            <h3 className="text-lg font-medium">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {item.body}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">From the ground</h2>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium underline underline-offset-2"
          >
            Read the blog
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY.map((item) => (
            <figure key={item.src} className="group space-y-2">
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="text-xs tracking-wide text-zinc-500 uppercase">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/images/banners/harmattan.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative grid gap-8 px-6 py-14 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Looking ahead
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Maecenas sed diam eget risus varius blandit sit amet non magna.
              Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id
              ligula porta felis euismod semper.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 md:items-end">
            <Link
              href="/register"
              className="inline-flex bg-white px-4 py-2.5 text-xs font-bold tracking-[0.14em] text-black uppercase"
            >
              Join Cone Club
            </Link>
            <Link
              href="/contact"
              className="inline-flex border border-white/50 px-4 py-2.5 text-xs font-bold tracking-[0.14em] text-white uppercase"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
