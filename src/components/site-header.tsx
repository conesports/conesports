import Link from "next/link";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { HeaderChrome } from "@/components/site-nav";
import { getHomepageContent } from "@/lib/homepage-content";

export async function SiteHeader() {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  const content = await getHomepageContent();

  return (
    <div className="sticky top-0 z-50">
      {content.promoBar.text ? (
        <p className="bg-black px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">
          {content.promoBar.text}
        </p>
      ) : null}
      <div className="hidden items-center justify-end gap-5 bg-white px-8 py-1.5 text-[11px] text-zinc-600 lg:flex">
        <Link href="/about" className="hover:text-black">
          About Us
        </Link>
        <Link href="/blog" className="hover:text-black">
          Blog
        </Link>
        <Link href="/faq" className="hover:text-black">
          Help
        </Link>
        <Link href="/account" className="hover:text-black">
          Orders & returns
        </Link>
        <Link href="/register" className="hover:text-black">
          Join Cone Club
        </Link>
      </div>
      <HeaderChrome loggedIn={Boolean(session?.user)} />
    </div>
  );
}
