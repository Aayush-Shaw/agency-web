import type { Metadata, Viewport } from "next";
import { Questrial, Poppins } from "next/font/google";
import "./globals.css";
import ScrollBar from "@/components/ui/ScrollBar";
import SmoothScroll from "@/components/ui/SmoothScroll";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/constants";

// Display: Questrial ships a single 400 weight - there is no bold cut, so the
// bold on headings is the browser's synthetic emboldening (a deliberate choice:
// keeping Questrial mattered more than crisp stems at display sizes). Anything
// >=600 synthesises identically, so font-semibold and font-bold look the same
// until this is swapped for a family that ships real weights.
const display = Questrial({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-questrial",
});
// Body: Poppins is not a variable font, so only the weights listed here are
// downloaded - 400 body, 500 nav/labels, 600 buttons and emphasis.
const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Digi Bear - Design, Motion & AI Video Studio",
  description:
    "Digi Bear is a full-service digital studio specializing in Next.js web development, motion graphics, AI-generated video production, social media marketing, and professional video editing for ambitious brands in the US, UK, and Europe.",
  // Points at the same file the navbar and footer render, rather than a second
  // copy under app/ as icon.svg - one asset, one place to update it.
  icons: { icon: "/digibear-logo.svg" },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "digital agency",
    "web design agency",
    "Next.js web development",
    "AI video production",
    "AI-generated avatars",
    "motion graphics studio",
    "social media marketing agency",
    "video editing service",
    "full-service digital studio",
    "Digi Bear",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Digi Bear",
    title: "Digi Bear - Design, Motion & AI Video Studio",
    description:
      "Full-service digital studio: web design & development, social media marketing, motion graphics, video editing, and AI-generated video for ambitious brands.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digi Bear - Design, Motion & AI Video Studio",
    description:
      "Full-service digital studio: web design, motion graphics, AI video, social media, and video editing.",
  },
};

// Tells the UA to render its own surfaces (scrollbars, form controls, the
// mobile address bar) in the matching scheme before our CSS lands. Flat
// `light` now that the site has one palette - the hero's dark stage sets its
// own color-scheme locally and doesn't want the whole document following it.
export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        {/* JSON-LD structured data - Organization, Services, FAQPage.
            Rendered before visual content so crawlers see it immediately. */}
        <JsonLd />

        {/* Film grain - non-interactive, stationary while the page scrolls
            under it, and above the navbar (z-60 vs z-50) so nothing escapes
            it. */}
        <div className="grain" aria-hidden="true" />

        {/* Scrollbar. Sits above the grain (z-70 vs z-60) so the noise doesn't
            dull it, and outside <main> because it belongs to the viewport
            rather than to the page's content. */}
        <ScrollBar />

        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
