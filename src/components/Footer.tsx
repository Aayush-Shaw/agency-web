import type { ReactNode } from "react";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const socialIcon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    {path}
  </svg>
);

const SOCIALS = [
  {
    label: "X",
    href: "https://x.com",
    icon: socialIcon(
      <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5-6.6L5.5 22H2.4l8-9.2L1.5 2h6.9l4.5 6zM17.7 20h1.7L7 4H5.2z" />
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: socialIcon(
      <path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.3.5.6.2 1.1.5 1.6 1 .5.5.8 1 1 1.6.3.6.4 1.3.5 2.3.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.5 2.3a4.3 4.3 0 0 1-1 1.6c-.5.5-1 .8-1.6 1-.6.3-1.3.4-2.3.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.3-.5a4.3 4.3 0 0 1-1.6-1 4.3 4.3 0 0 1-1-1.6c-.3-.6-.4-1.3-.5-2.3C2 15 2 14.7 2 12s0-3 .1-4.1c0-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6.5-.5 1-.8 1.6-1 .6-.3 1.3-.4 2.3-.5C9 2 9.3 2 12 2zm0 1.8c-2.7 0-3 0-4 .1-.8 0-1.2.2-1.5.3-.4.1-.7.3-1 .6-.3.3-.5.6-.6 1-.1.3-.3.7-.3 1.5-.1 1-.1 1.3-.1 4s0 3 .1 4c0 .8.2 1.2.3 1.5.1.4.3.7.6 1 .3.3.6.5 1 .6.3.1.7.3 1.5.3 1 .1 1.3.1 4 .1s3 0 4-.1c.8 0 1.2-.2 1.5-.3.4-.1.7-.3 1-.6.3-.3.5-.6.6-1 .1-.3.3-.7.3-1.5.1-1 .1-1.3.1-4s0-3-.1-4c0-.8-.2-1.2-.3-1.5a2.7 2.7 0 0 0-.6-1 2.7 2.7 0 0 0-1-.6c-.3-.1-.7-.3-1.5-.3-1-.1-1.3-.1-4-.1zm0 3.1a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: socialIcon(
      <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.24 8h4.5v13H.24zM8.24 8h4.3v1.8h.06c.6-1.1 2-2.2 4.1-2.2 4.4 0 5.2 2.9 5.2 6.6V21h-4.5v-6c0-1.4 0-3.3-2-3.3s-2.3 1.5-2.3 3.2V21h-4.5z" />
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: socialIcon(
      <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12zM9.8 15.3V8.7l5.7 3.3z" />
    ),
  },
];

/** Section 13 — footer. */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-5 py-14 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <a
            href="#top"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight"
          >
            <span className="claw h-5 w-5" aria-hidden="true" />
            DIGITAL <span className="text-gradient">BEAR</span>
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
                  className="text-sm text-text-muted transition-colors hover:text-text"
                >
                  {link.label}
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent-primary hover:text-accent-primary"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-border pt-6 text-sm text-text-muted">
        © {new Date().getFullYear()} Digital Bear Studio. All rights reserved.
      </div>
    </footer>
  );
}
