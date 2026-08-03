import type { ReactNode } from "react";
import Roll from "@/components/ui/Roll";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  // Parked with the section itself — see page.tsx.
  // { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

/* Drawn here rather than imported: Lucide v1 dropped its brand icons, and the
   official marks are three different families anyway — a filled circle-f and a
   filled play card next to a hollow camera outline, which is what made the row
   look mismatched.
   So they share a chassis instead. Every mark is a rounded tile of the same
   width, on the same centre, at the same stroke weight, and only the glyph
   inside changes; the set reads as a set by construction rather than by eye.
   Instagram's mark is already a tile, so the house style is its logic extended
   to the other two.
   Grid, weight and round terminals also match the Lucide icons used elsewhere,
   so these sit with the navbar's Sun/Moon and the hero's ArrowUp. */
const TILE = <rect x="3" y="3" width="18" height="18" rx="5.5" />;

/* YouTube's badge is landscape, not square — a square reads as the wrong brand
   however consistent it is. It keeps the other tiles' width and centre and only
   loses height, so it still belongs to the row. The radius is cut to match:
   5.5 on a 12-tall box is nearly half its height and would round into a
   stadium. */
const TILE_WIDE = <rect x="3" y="6" width="18" height="12" rx="4" />;

const socialIcon = (glyph: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {glyph}
  </svg>
);

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    // Lens on the tile's centre, flash offset into the top-right quadrant.
    icon: socialIcon(
      <>
        {TILE}
        <circle cx="12" cy="12" r="4.1" />
        <path d="M16.7 7.3h.01" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    /* An 'f': stem up the centre, hooking right at the top, barred at the
       waist. Sized so the ink — not the stem — centres on the tile: the two
       strokes together span x 8.8→15.2 and y 7→17, both centred on 12. Judging
       it by the stem instead is what threw the earlier version 1px right, since
       the hook only ever extends one way. */
    icon: socialIcon(
      <>
        {TILE}
        <path d="M12.1 17V9.2A2.2 2.2 0 0 1 14.3 7h.9" />
        <path d="M8.8 11.9h5.4" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    /* Play triangle, centroid nudged right of centre so it reads as centred —
       a right-pointing triangle carries its mass on the left. */
    icon: socialIcon(
      <>
        {TILE_WIDE}
        <path d="m10.7 9.2 5.2 2.8-5.2 2.8z" />
      </>
    ),
  },
];

/** Section 13 — footer. */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-5 py-14 md:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <a
            href="#top"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight"
          >
            <span className="claw h-5 w-5" aria-hidden="true" />
            <Roll>
              DIGITAL <span className="text-gradient">BEAR</span>
            </Roll>
          </a>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            A full-service digital studio — design, motion, and AI video for
            ambitious brands in the US, UK, and Europe.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3">
            {NAV.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-block py-1.5 text-sm text-text-muted transition-colors hover:text-text"
                >
                  <Roll>{link.label}</Roll>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex gap-3">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="group relative block h-11 w-11 overflow-hidden rounded-full border border-border text-text-muted transition-[transform,border-color] duration-500 ease-(--ease-elastic) hover:-translate-y-1 hover:border-accent-primary"
            >
              {/* The accent floods up from the bottom edge. Deliberately not
                  --ease-elastic like the rest: an overshoot would carry the
                  fill's top edge past the button and flash a gap underneath. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-y-full bg-linear-to-r from-accent-primary to-accent-secondary transition-transform duration-420 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0"
              />
              {/* Two copies of the mark on one reel: the resting one rolls out
                  of the top as its twin rides in on the flood. Same twin-icon
                  swap the hero CTA's arrow uses, turned vertical. */}
              <span className="absolute inset-0 grid place-items-center transition-transform duration-520 ease-(--ease-elastic) group-hover:-translate-y-full">
                {social.icon}
              </span>
              <span className="absolute inset-0 grid translate-y-full place-items-center text-bg transition-transform duration-520 ease-(--ease-elastic) group-hover:translate-y-0">
                {social.icon}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1600px] border-t border-border pt-6 text-sm text-text-muted">
        © {new Date().getFullYear()} Digital Bear Studio. All rights reserved.
      </div>
    </footer>
  );
}
