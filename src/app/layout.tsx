import type { Metadata, Viewport } from "next";
import { Questrial, Poppins } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

// Display: Questrial ships a single 400 weight — there is no bold cut, so the
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
// downloaded — 400 body, 500 nav/labels, 600 buttons and emphasis.
const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Digital Bear — Design, Motion & AI Video Studio",
  description:
    "Digital Bear is a full-service digital studio for ambitious brands: website design & development, social media marketing, motion graphics, video editing, and AI-generated avatars & video.",
};

// Tells the UA to render its own surfaces (scrollbars, form controls, the mobile
// address bar) in the matching scheme before our CSS lands. No themeColor pair:
// those only track the OS, which the toggle is now free to disagree with.
export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs during HTML parsing, before first paint: no theme flash. Writes
            the attribute so [data-theme] is the single source both CSS and the
            toggle read.

            Resolved from the device every load, with nothing persisted. Reading
            a saved value here instead is what pinned the site to a stale theme
            and made it ignore the OS from then on; the toggle is a session-only
            override, so a reload deliberately returns to the device preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{d.dataset.theme=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}catch(e){d.dataset.theme="light"}})()`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        {/* Film grain — non-interactive, stationary while the page scrolls
            under it, and above the navbar (z-60 vs z-50) so nothing escapes
            it. The .atmosphere backdrop it used to sit beside now lives inside
            page.tsx's post-hero sheet, which is opaque; see the note there. */}
        <div className="grain" aria-hidden="true" />

        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
