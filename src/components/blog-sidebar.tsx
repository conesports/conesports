import Image from "next/image";
import Link from "next/link";
import {
  formatBlogDate,
  getBlogTags,
  getRecentBlogPosts,
} from "@/lib/blog-posts";

export function BlogSidebar({ excludeSlug }: { excludeSlug?: string }) {
  const recent = getRecentBlogPosts(excludeSlug);
  const tags = getBlogTags();

  return (
    <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
      <section className="space-y-3 border border-zinc-200 p-5">
        <h2 className="text-xs font-bold tracking-[0.14em] uppercase">
          About this journal
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Notes from the
          pitch, training floor, and street — placeholder copy for now.
        </p>
        <Link
          href="/about"
          className="inline-block text-sm font-medium underline underline-offset-2"
        >
          About Us
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold tracking-[0.14em] uppercase">
          Recent posts
        </h2>
        <ul className="space-y-4">
          {recent.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-[72px_1fr] gap-3"
              >
                <span className="relative block aspect-square overflow-hidden bg-zinc-100">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] tracking-wide text-zinc-500 uppercase">
                    {formatBlogDate(post.date)}
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-snug group-hover:underline">
                    {post.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-[0.14em] uppercase">Topics</h2>
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700">
                {tag}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 bg-black px-5 py-6 text-white">
        <h2 className="text-xs font-bold tracking-[0.14em] uppercase">
          Shop the kit
        </h2>
        <p className="text-sm text-white/75">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt.
        </p>
        <Link
          href="/shop"
          className="inline-flex border border-white px-3 py-2 text-xs font-bold tracking-[0.14em] uppercase transition hover:bg-white hover:text-black"
        >
          Shop all
        </Link>
      </section>
    </aside>
  );
}
