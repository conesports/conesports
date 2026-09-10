import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact ConeSports.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Contact</h1>
      <p className="mb-6 max-w-md text-sm text-zinc-600">
        Questions about an order or the catalog? Send a message and we will reply by email.
      </p>
      <ContactForm />
    </section>
  );
}
