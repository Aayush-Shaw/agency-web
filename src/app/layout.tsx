import type { Metadata, Viewport } from "next";
import { Questrial, Poppins } from "next/font/google";
import "./globals.css";
import ScrollBar from "@/components/ui/ScrollBar";
import SmoothScroll from "@/components/ui/SmoothScroll";

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
  title: "Digi Bear - Design, Motion & AI Video Studio",
  description:
    "Digi Bear is a full-service digital studio for ambitious brands: website design & development, social media marketing, motion graphics, video editing, and AI-generated avatars & video.",
  // Points at the same file the navbar and footer render, rather than a second
  // copy under app/ as icon.svg - one asset, one place to update it.
  icons: { icon: "/digibear-logo.svg" },
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
