import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontMain } from "@/components/storefront-main";
import { MobileAppPreload } from "@/components/mobile-app-preload";

export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="preload"
        href="/videos/conevid-mobile.mp4"
        as="video"
        type="video/mp4"
        media="(max-width: 1023px)"
      />
      <MobileAppPreload />
      <SiteHeader />
      <StorefrontMain>{children}</StorefrontMain>
      <SiteFooter />
    </>
  );
}
