import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogSidebar } from "@/components/blog-sidebar";
import { ShareButtons } from "@/components/share-buttons";
import { BLOG_POSTS, formatBlogDate, getBlogPost } from "@/lib/blog-posts";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const shareUrl = absoluteUrl(`/blog/${post.slug}`);

  return (
    <section className="space-y-6">
      <p>
        <Link href="/blog" className="text-sm text-zinc-600 hover:underline">
          ← Blog
        </Link>
      </p>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="space-y-6">
          <header className="space-y-3">
            <p className="text-xs tracking-wide text-zinc-500 uppercase">
              {formatBlogDate(post.date)}
            </p>
            <h1 className="text-2xl font-semibold md:text-3xl">{post.title}</h1>
            <p className="text-sm text-zinc-600">{post.excerpt}</p>
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
          </header>

          <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
            />
          </div>

          <ShareButtons url={shareUrl} title={post.title} />

          <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
            {post.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div className="border-t border-zinc-200 pt-6">
            <ShareButtons url={shareUrl} title={post.title} />
          </div>
        </article>

        <BlogSidebar excludeSlug={post.slug} />
      </div>
    </section>
  );
}
