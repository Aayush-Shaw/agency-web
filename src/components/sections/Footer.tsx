import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import Roll from "@/components/ui/Roll";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#work" },
  { label: "Process", href: "#process" },
  // Parked with the section itself - see page.tsx.
  // { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const BrandIcon = ({ viewBox = "0 0 16 16", children }: { viewBox?: string; children: ReactNode }) => (
  <svg
    viewBox={viewBox}
    className="h-5 w-5 fill-current"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SOCIALS = [
  {
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    icon: (
      <BrandIcon viewBox="0 0 32 32">
        <path d="M25.805 7.996c0 0 0 0.001 0 0.001 0 0.994-0.806 1.799-1.799 1.799s-1.799-0.806-1.799-1.799c0-0.994 0.806-1.799 1.799-1.799v0c0.993 0.001 1.798 0.805 1.799 1.798v0zM16 20.999c-2.761 0-4.999-2.238-4.999-4.999s2.238-4.999 4.999-4.999c2.761 0 4.999 2.238 4.999 4.999v0c0 0 0 0.001 0 0.001 0 2.76-2.237 4.997-4.997 4.997-0 0-0.001 0-0.001 0h0zM16 8.3c0 0 0 0-0 0-4.253 0-7.7 3.448-7.7 7.7s3.448 7.7 7.7 7.7c4.253 0 7.7-3.448 7.7-7.7v0c0-0 0-0 0-0.001 0-4.252-3.447-7.7-7.7-7.7-0 0-0 0-0.001 0h0zM16 3.704c4.003 0 4.48 0.020 6.061 0.089 1.003 0.012 1.957 0.202 2.84 0.538l-0.057-0.019c1.314 0.512 2.334 1.532 2.835 2.812l0.012 0.034c0.316 0.826 0.504 1.781 0.516 2.778l0 0.005c0.071 1.582 0.087 2.057 0.087 6.061s-0.019 4.48-0.092 6.061c-0.019 1.004-0.21 1.958-0.545 2.841l0.019-0.058c-0.258 0.676-0.64 1.252-1.123 1.726l-0.001 0.001c-0.473 0.484-1.049 0.866-1.692 1.109l-0.032 0.011c-0.829 0.316-1.787 0.504-2.788 0.516l-0.005 0c-1.592 0.071-2.061 0.087-6.072 0.087-4.013 0-4.481-0.019-6.072-0.092-1.008-0.019-1.966-0.21-2.853-0.545l0.059 0.019c-0.676-0.254-1.252-0.637-1.722-1.122l-0.001-0.001c-0.489-0.47-0.873-1.047-1.114-1.693l-0.010-0.031c-0.315-0.828-0.506-1.785-0.525-2.785l-0-0.008c-0.056-1.575-0.076-2.061-0.076-6.053 0-3.994 0.020-4.481 0.076-6.075 0.019-1.007 0.209-1.964 0.544-2.85l-0.019 0.059c0.247-0.679 0.632-1.257 1.123-1.724l0.002-0.002c0.468-0.492 1.045-0.875 1.692-1.112l0.031-0.010c0.823-0.318 1.774-0.509 2.768-0.526l0.007-0c1.593-0.056 2.062-0.075 6.072-0.075zM16 1.004c-4.074 0-4.582 0.019-6.182 0.090-1.315 0.028-2.562 0.282-3.716 0.723l0.076-0.025c-1.040 0.397-1.926 0.986-2.656 1.728l-0.001 0.001c-0.745 0.73-1.333 1.617-1.713 2.607l-0.017 0.050c-0.416 1.078-0.67 2.326-0.697 3.628l-0 0.012c-0.075 1.6-0.090 2.108-0.090 6.182s0.019 4.582 0.090 6.182c0.028 1.315 0.282 2.562 0.723 3.716l-0.025-0.076c0.796 2.021 2.365 3.59 4.334 4.368l0.052 0.018c1.078 0.415 2.326 0.669 3.628 0.697l0.012 0c1.6 0.075 2.108 0.090 6.182 0.090s4.582-0.019 6.182-0.090c1.315-0.029 2.562-0.282 3.716-0.723l-0.076 0.026c2.021-0.796 3.59-2.365 4.368-4.334l0.018-0.052c0.416-1.078 0.669-2.326 0.697-3.628l0-0.012c0.075-1.6 0.090-2.108 0.090-6.182s-0.019-4.582-0.090-6.182c-0.029-1.315-0.282-2.562-0.723-3.716l0.026 0.076c-0.398-1.040-0.986-1.926-1.729-2.656l-0.001-0.001c-0.73-0.745-1.617-1.333-2.607-1.713l-0.050-0.017c-1.078-0.416-2.326-0.67-3.628-0.697l-0.012-0c-1.6-0.075-2.108-0.090-6.182-0.090z" />
      </BrandIcon>
    ),
  },
  {
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    icon: (
      <BrandIcon>
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
      </BrandIcon>
    ),
  },
  {
    label: "YouTube",
    href: SOCIAL_LINKS.youtube,
    icon: (
      <BrandIcon>
        <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
      </BrandIcon>
    ),
  },
  {
    label: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    icon: (
      <BrandIcon>
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
      </BrandIcon>
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
            An all in one digital studio for ambitious brands. Websites, branding, video, AI avatars, social media, and ads, all under one roof, serving clients across the World.
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
