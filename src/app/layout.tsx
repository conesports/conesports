import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE_DESCRIPTION, SITE_NAME, siteOrigin } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-calligraphy",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/images/cone-favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/images/cone-favicon.png",
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-NG"
      className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-950">
        <style
          dangerouslySetInnerHTML={{
            __html: 'html[data-mobile-preload=open]{background:#000}html[data-mobile-preload=open],html[data-mobile-preload=open] body{overflow:hidden}html[data-mobile-preload=open] body{background:#000}.mobile-preload{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;display:flex;flex-direction:column;overflow:hidden;background:#000;color:#fff}@media (min-width:1024px){.mobile-preload{display:none!important}}',
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: '(function(){try{var p=location.pathname;if(p==="/admin"||p.indexOf("/admin/")===0)return;if(window.matchMedia("(max-width:1023px)").matches){document.documentElement.setAttribute("data-mobile-preload","open")}}catch(e){}})();',
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
