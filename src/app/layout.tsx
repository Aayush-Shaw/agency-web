import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

// Display: bold, geometric grotesk. Body: Inter for long-form legibility.
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        {/* Runs during HTML parsing, before first paint: no theme flash. Always
            writes the attribute (resolving the OS pref when nothing is saved)
            so [data-theme] is the single source both CSS and the toggle read. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.dataset.theme=localStorage.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-dvh pb-24 md:pb-0">
        {/* Fixed backdrop + film grain — both non-interactive, both stationary
            while the page scrolls over them. */}
        <div className="atmosphere" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />

        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
