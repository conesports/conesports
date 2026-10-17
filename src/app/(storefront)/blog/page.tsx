import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogSidebar } from "@/components/blog-sidebar";
import { BLOG_POSTS, formatBlogDate } from "@/lib/blog-posts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "News and notes from ConeSports.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <section className="space-y-8">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Blog</h1>
        <p className="text-sm text-zinc-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ul className="space-y-8">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <article className="grid gap-5 border-b border-zinc-200 pb-8 sm:grid-cols-[220px_1fr] last:border-b-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-zinc-100"
                >
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 220px"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </Link>
                <div className="space-y-3">
                  <p className="text-xs tracking-wide text-zinc-500 uppercase">
                    {formatBlogDate(post.date)}
                  </p>
                  <h2 className="text-xl font-medium leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm leading-relaxed text-zinc-700">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium underline underline-offset-2"
                    >
                      Read more
                    </Link>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <BlogSidebar />
      </div>
    </section>
  );
}
