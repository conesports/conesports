import type { Metadata } from "next";
import { getFaqItems } from "@/lib/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Frequently asked questions.",
  path: "/faq",
});

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const items = await getFaqItems();

  return (
    <section className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">FAQ</h1>
      {items.map((item) => (
        <article key={item.question} className="text-sm">
          <h2 className="font-medium">{item.question}</h2>
          <p className="mt-1 whitespace-pre-wrap text-zinc-700">{item.answer}</p>
        </article>
      ))}
    </section>
  );
}
