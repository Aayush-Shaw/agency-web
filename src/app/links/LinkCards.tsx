"use client";

import { type ReactNode, type ReactElement, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { SITE_URL, SITE_DOMAIN, SOCIAL_LINKS, CONTACT_PHONE } from "@/lib/constants";

/* ================================================================
   Icons — same chassis as Footer.tsx: one viewBox, shared stroke
   weight, round terminals. Brand marks are hand-drawn, not imported,
   because Lucide v1 dropped brand icons and mixing icon families
   looks mismatched (see the Footer's own commentary).
   ================================================================ */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const TILE = <rect x="3" y="3" width="18" height="18" rx="5.5" />;
const TILE_WIDE = <rect x="3" y="6" width="18" height="12" rx="4" />;

const icons: Record<string, ReactNode> = {
  website: (
    <svg {...ICON_PROPS}>
      {/* Globe/browser — a circle with two meridians and the equator. */}
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  tiktok: (
    <svg {...ICON_PROPS}>
      {TILE}
      <circle cx="10.4" cy="15.1" r="2.5" />
      <path d="M12.9 15.1V6.6c.4 1.8 1.8 3.1 3.4 3.3" />
    </svg>
  ),
  youtube: (
    <svg {...ICON_PROPS}>
      {TILE_WIDE}
      <path d="m10.7 9.2 5.2 2.8-5.2 2.8z" />
    </svg>
  ),
  instagram: (
    <svg {...ICON_PROPS}>
      {TILE}
      <circle cx="12" cy="12" r="4.1" />
      <path d="M16.7 7.3h.01" />
    </svg>
  ),
  facebook: (
    <svg {...ICON_PROPS}>
      {TILE}
      <path d="M12.1 17V9.2A2.2 2.2 0 0 1 14.3 7h.9" />
      <path d="M8.8 11.9h5.4" />
    </svg>
  ),
};

/* Larger icon for the bottom-sheet hero card. */
const bigIcon = (id: string) => {
  const el = icons[id] as ReactElement<{ children?: ReactNode }> | undefined;
  return (
    <svg {...ICON_PROPS} className="link-sheet-icon">
      {el?.props?.children}
    </svg>
  );
};

/* ================================================================
   Share-app icons (WhatsApp, Facebook, X/Twitter, LinkedIn).
   Small inline SVGs — same stroke chassis as above.
   ================================================================ */
const shareIcons: Record<string, ReactNode> = {
  whatsapp: (
    <svg {...ICON_PROPS} className="h-5 w-5">
      {/* Phone handset inside a speech bubble. */}
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  facebook: (
    <svg {...ICON_PROPS} className="h-5 w-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  x: (
    <svg {...ICON_PROPS} className="h-5 w-5">
      {/* X mark — two crossed strokes. */}
      <path d="M4 4l7.07 8.5M20 20l-7.07-8.5m0 0L20 4M11.07 12.5 4 20" />
    </svg>
  ),
  linkedin: (
    <svg {...ICON_PROPS} className="h-5 w-5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

/* Three-dot icon */
const DotsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="6" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="18" r="1.5" />
  </svg>
);

/* WhatsApp icon (larger, for the floating button) */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ================================================================
   Link entries
   ================================================================ */

interface LinkEntry {
  id: string;
  label: string;
  href: string;
  /** Handle name shown in the bottom sheet. */
  handle: string;
  /** Extra CSS classes for the card's background. */
  bgClass: string;
}

const LINKS: LinkEntry[] = [
  {
    id: "website",
    label: "Website",
    href: SOCIAL_LINKS.website,
    handle: SITE_DOMAIN,
    bgClass: "link-bg-website brand-gradient",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    handle: "@digibearca",
    bgClass: "link-bg-tiktok",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: SOCIAL_LINKS.youtube,
    handle: "@digibearca",
    bgClass: "link-bg-youtube",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    handle: "@digibearca",
    bgClass: "link-bg-instagram",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    handle: "Digi Bear",
    bgClass: "link-bg-facebook",
  },
];

/* ================================================================
   Projects — website projects from the Work section
   ================================================================ */

const PROJECTS = [
  { title: "AutoNorth Motors", src: "/work/autonorth-motors.jpg", href: "https://autonorth-motors.vercel.app/" },
  { title: "Indian Grill", src: "/work/indian-grill.jpg", href: "https://indiangrill.vercel.app/" },
  { title: "Auto Loan Calculator", src: "/work/AutoNorth-Motors.png", href: "https://autonorthab.ca/" },
  { title: "Earls", src: "/work/earls.jpg", href: "https://services0987.github.io/earls/" },
  { title: "JUJCO Heating & Cooling", src: "/work/jujco-hvac.png", href: "https://digibearca.github.io/JUJCO-HVAC-website/" },
];

const AI_VIDEOS = [
  { title: "DigiBear Promo", src: "/vid/grid/digibear-promo_AI.mp4" },
  { title: "Mustang Walkaround", src: "/vid/grid/mustang-walkarround_AI.mp4" },
  { title: "Language", src: "/vid/grid/language_AI.mp4" },
  { title: "Bronco", src: "/vid/grid/bronco_AI.mp4" },
];

/* ================================================================
   Share helpers
   ================================================================ */

function shareUrl(linkId: string) {
  return `${SITE_URL}/links?highlight=${linkId}`;
}

const SHARE_APPS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    url: (text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    url: (link: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
  },
  {
    id: "x",
    label: "X",
    url: (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: (link: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
  },
];

/* ================================================================
   Component
   ================================================================ */

export default function LinkCards({ highlight }: { highlight?: string }) {
  const [sheet, setSheet] = useState<LinkEntry | null>(null);
  const [toast, setToast] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* ── Open bottom sheet ── */
  const openSheet = useCallback(
    (e: React.MouseEvent, entry: LinkEntry) => {
      e.preventDefault();
      e.stopPropagation();
      setSheet(entry);
      // Wait one tick so React renders the dialog before showModal.
      requestAnimationFrame(() => dialogRef.current?.showModal());
    },
    [],
  );

  /* ── Close bottom sheet ── */
  const closeSheet = useCallback(() => {
    dialogRef.current?.close();
    setSheet(null);
  }, []);

  /* ── Copy link ── */
  const copyLink = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setToast(true);
        setTimeout(() => setToast(false), 1800);
      });
    },
    [],
  );

  return (
    <>
      {/* ── Social link cards ── */}
      <div className="flex w-full max-w-md flex-col gap-3">
        {LINKS.map((entry) => (
          <a
            key={entry.id}
            id={`link-${entry.id}`}
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`link-card ${entry.bgClass}${highlight === entry.id ? " link-highlight" : ""}`}
          >
            {/* Platform icon */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {icons[entry.id]}
            </span>

            {/* Label */}
            <span>{entry.label}</span>

            {/* Three-dot button */}
            <button
              type="button"
              className="link-dots"
              aria-label={`Share ${entry.label}`}
              onClick={(e) => openSheet(e, entry)}
            >
              <DotsIcon />
            </button>
          </a>
        ))}
      </div>

      {/* ── Projects section ── */}
      <div className="mt-12 w-full max-w-md">
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text">
          Our <span className="text-gradient">Websites</span>
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {PROJECTS.map((project) => (
            <a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-project-card group shrink-0 w-[60%] snap-center"
            >
              <Image
                src={project.src}
                alt={project.title}
                width={400}
                height={250}
                className="link-project-img"
              />
              <span className="link-project-title">{project.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── AI Videos section ── */}
      <div className="mt-12 w-full max-w-md">
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text">
          Our <span className="text-gradient">AI Videos</span>
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {AI_VIDEOS.map((vid) => (
            <div
              key={vid.src}
              className="link-project-card shrink-0 w-[40%] snap-center"
            >
              <video
                src={vid.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-9/16 object-cover pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky WhatsApp button ── */}
      <a
        href={`https://api.whatsapp.com/send?phone=${CONTACT_PHONE.replace(/[^+\d]/g, "")}&text=Hi%20Digi%20Bear!%20I%20found%20you%20via%20your%20links%20page.`}
        target="_blank"
        rel="noopener noreferrer"
        className="link-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
        <span>Chat with us</span>
      </a>

      {/* ── Bottom sheet ── */}
      <dialog
        ref={dialogRef}
        className="link-sheet"
        onClick={(e) => {
          // Close when tapping the backdrop (the dialog element itself).
          if (e.target === e.currentTarget) closeSheet();
        }}
      >
        {sheet && (
          <div className="link-sheet-panel">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button 
                type="button" 
                className="p-2 text-text-muted hover:text-text rounded-full transition-colors -mr-2 -mt-2"
                onClick={closeSheet}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Hero card with platform background */}
            <div
              className={`link-sheet-hero ${sheet.bgClass}`}
            >
              {bigIcon(sheet.id)}
              <span className="link-sheet-handle">{sheet.handle}</span>
              <span className="link-sheet-url">{sheet.href}</span>
            </div>

            {/* Copy / Open */}
            <div className="link-sheet-actions">
              <button
                type="button"
                className="link-sheet-btn"
                onClick={() => copyLink(shareUrl(sheet.id))}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Link
              </button>
              <a
                href={sheet.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-sheet-btn"
                onClick={closeSheet}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open Link
              </a>
            </div>

            {/* Share via apps */}
            <p className="link-sheet-share-label">Share via</p>
            <div className="link-sheet-share-row">
              {SHARE_APPS.map((app) => (
                <a
                  key={app.id}
                  href={app.url(shareUrl(sheet.id))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-sheet-share-btn"
                  aria-label={`Share on ${app.label}`}
                  onClick={closeSheet}
                >
                  {shareIcons[app.id]}
                </a>
              ))}
            </div>
          </div>
        )}
      </dialog>

      {/* Toast */}
      <div className={`link-toast${toast ? " show" : ""}`} role="status">
        Link copied!
      </div>
    </>
  );
}
