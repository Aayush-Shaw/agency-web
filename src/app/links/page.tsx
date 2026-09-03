import type { Metadata } from "next";
import Image from "next/image";
import { SITE_URL } from "@/lib/constants";
import MeshGradient from "@/components/ui/MeshGradient";
import LinkCards from "./LinkCards";
import LinkActions from "./LinkActions";

// A versioned, absolute URL ensures social crawlers fetch the current card
// instead of retaining a previously cached preview for this route.
const SOCIAL_IMAGE = `${SITE_URL}/og-image.jpg?v=1`;

export const metadata: Metadata = {
  title: "Links | Digi Bear",
  description:
    "All of Digi Bear's official links in one place — website, TikTok, YouTube, Instagram, and Facebook.",
  alternates: { canonical: "/links" },
  openGraph: {
    type: "website",
    url: "/links",
    siteName: "Digi Bear",
    title: "Links | Digi Bear",
    description:
      "All of Digi Bear's official links in one place — website, TikTok, YouTube, Instagram, and Facebook.",
    images: [
      {
        url: SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: "Digi Bear's featured web projects and AI video showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Links | Digi Bear",
    description: "All of Digi Bear's official links in one place.",
    images: [SOCIAL_IMAGE],
  },
};

/**
 * /links — a standalone link-in-bio page.
 *
 * The page is a server component; interactive behaviour (highlight, bottom
 * sheet) lives in the `LinkCards` client component below. `searchParams` is
 * a request-time API, so the page opts into dynamic rendering whenever a
 * `?highlight=` query is present.
 */
export default async function LinksPage(props: {
  searchParams: Promise<{ highlight?: string }>;
}) {
  const { highlight } = await props.searchParams;

  return (
    <div className="relative z-0 min-h-dvh overflow-clip bg-bg">
      <style>{`
        /* Restore native scrollbar for this page only */
        @media (any-pointer: fine) and (any-hover: hover) {
          html { scrollbar-width: auto !important; }
          html::-webkit-scrollbar { 
            display: block !important; 
            width: 14px !important;
            background: var(--color-bg) !important;
          }
          html::-webkit-scrollbar-thumb {
            background: color-mix(in oklab, var(--color-text) 25%, transparent) !important;
            border-radius: 99px !important;
            border: 4px solid var(--color-bg) !important;
          }
          html::-webkit-scrollbar-thumb:hover {
            background: color-mix(in oklab, var(--color-text) 40%, transparent) !important;
          }
        }
      `}</style>
      
      {/* Animated mesh gradient background — same field as the main page,
          sitting behind all content. */}
      <MeshGradient />

      <LinkActions />

      {/* Content sits above the mesh. */}
      <div className="relative z-10 flex w-full flex-col items-center px-5 pt-10 pb-28">
        {/* ── Logo lockup: circular logo + brand name ── */}
        <a
          href={SITE_URL}
          className="mb-8 flex flex-col items-center text-text"
        >
          {/* Circular logo container */}
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border p-2 pl-3 border-border bg-bg shadow-lg">
            <Image
              src="/digibear-logo.svg"
              alt="Digi Bear logo"
              width={64}
              height={64}
              className="h-14 w-auto"
              priority
            />
          </div>
          {/* Brand name */}
          <span className="font-display text-3xl mt-2 font-bold tracking-tight">
            DIGI <span className="text-gradient">BEAR</span>
          </span>
          <span className="text-sm text-text-muted">
            Design, Video &amp; AI Studio
          </span>
        </a>

        <LinkCards highlight={highlight} />
      </div>
    </div>
  );
}
