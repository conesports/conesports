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
      <MobileAppPreload />
      <SiteHeader />
      <StorefrontMain>{children}</StorefrontMain>
      <SiteFooter />
    </>
  );
}
