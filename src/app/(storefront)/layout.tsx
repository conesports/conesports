import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontMain } from "@/components/storefront-main";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <StorefrontMain>{children}</StorefrontMain>
      <SiteFooter />
    </>
  );
}
