import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import Roll from "@/components/ui/Roll";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  // Parked with the section itself - see page.tsx.
  // { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

/* Drawn here rather than imported: Lucide v1 dropped its brand icons, and the
   official marks are three different families anyway - a filled circle-f and a
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

/* YouTube's badge is landscape, not square - a square reads as the wrong brand
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
    href: SOCIAL_LINKS.instagram,
    // Lens on the tile's centre, flash offset into the top-right quadrant.
    icon: socialIcon(
      <>
        {TILE}
        <circle cx="12" cy="12" r="4.1" />
        <path d="M16.7 7.3h.01" />
      </>,
    ),
  },
  {
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    /* An 'f': stem up the centre, hooking right at the top, barred at the
       waist. Sized so the ink - not the stem - centres on the tile: the two
       strokes together span x 8.8→15.2 and y 7→17, both centred on 12. Judging
       it by the stem instead is what threw the earlier version 1px right, since
       the hook only ever extends one way. */
    icon: socialIcon(
      <>
        {TILE}
        <path d="M12.1 17V9.2A2.2 2.2 0 0 1 14.3 7h.9" />
        <path d="M8.8 11.9h5.4" />
      </>,
    ),
  },
  {
    label: "YouTube",
    href: SOCIAL_LINKS.youtube,
    /* Play triangle, centroid nudged right of centre so it reads as centred -
       a right-pointing triangle carries its mass on the left. */
    icon: socialIcon(
      <>
        {TILE_WIDE}
        <path d="m10.7 9.2 5.2 2.8-5.2 2.8z" />
      </>,
    ),
  },
];

/** Section 13 - footer. */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-5 pt-14 pb-2 md:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <a
            href="#"
            className="flex items-center gap-0 lg:gap-1 font-display text-lg font-bold tracking-tight"
          >
            {/* Same plain <img> as the navbar lockup - see the note there. */}
            <img
              src="/digibear-logo.svg"
              alt=""
              className="h-7 w-auto"
              aria-hidden="true"
            />
            <Roll>
              DIGI <span className="text-gradient">BEAR</span>
            </Roll>
          </a>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Digi Bear is a full-service digital studio specializing in Next.js
            web development, AI-generated video production, motion graphics,
            social media marketing, and professional video editing for brands in
            the US, UK, and Europe.
          </p>
        </div>

        {/* One three-column row on a phone: the five links fill the first two
            columns and the three social marks stack down the third, so both
            halves are three rows tall and the block squares off. md:contents
            dissolves this wrapper again, leaving the desktop flex row exactly
            as it was - no second copy of either child. */}
        <div className="grid grid-cols-3 gap-x-6 md:contents">
          <nav aria-label="Footer" className="col-span-2">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3">
              {NAV.map((link) => (
                // The nav's two columns are the phone grid's first and second,
                // so the middle column of the footer is this list's even
                // children - row-major flow puts 2 and 4 in column two. Centred
                // there, the row reads left / centre / right across the three
                // columns. Back to flush left at md, where the socials are a
                // row again and there is no middle column to speak of.
                <li key={link.href} className="even:text-center md:even:text-left">
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

          {/* items-end so the stack hugs the footer's right edge rather than
            floating mid-column - the marks are 44px in a ~96px column. */}
          <div className="flex flex-col items-end gap-3 md:flex-row md:items-start">
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
                  className="absolute inset-0 translate-y-full brand-gradient transition-transform duration-420 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0"
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
      </div>

      <div className="mx-auto mt-4 max-w-[1600px] border-t border-border pt-4 text-sm text-text-muted text-center">
        © {new Date().getFullYear()} Digi Bear. All rights reserved.
      </div>
    </footer>
  );
}
