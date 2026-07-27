"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// The <head> script in layout.tsx guarantees data-theme is always set, so this
// only has to flip it. localStorage is what makes the choice survive a reload.
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.theme = next;
}

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Frost the bar as soon as the page moves; hold the CTAs back until the hero
  // is behind us. Observed on rockstargames.com/VI: the nav is logo + menu at
  // 0%, and the pre-order pill has entered the bar by 25% — on both breakpoints.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setPastHero(y > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Shared entrance for both CTAs: invisible also drops them from the tab order
  // while hidden, so keyboard users don't hit a control they can't see.
  const ctaState = pastHero
    ? "visible translate-y-0 opacity-100"
    : "invisible opacity-0";

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-bg/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <a
          href="#top"
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          <span className="claw h-5 w-5" aria-hidden="true" />
          DIGITAL <span className="text-gradient">BEAR</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Theme toggle. The DOM attribute is the state — no React state, so
              nothing to hydrate and the icon swap is pure CSS. */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:text-text"
          >
            <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
            <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
          </button>

          {/* Desktop CTA — enters once the hero is behind us. */}
          <a
            href="#contact"
            className={`glow hidden -translate-y-2 rounded-full bg-linear-to-r from-accent-primary to-accent-secondary px-5 py-2.5 text-sm font-semibold text-bg transition-all duration-700 ease-out hover:scale-[1.03] md:inline-flex ${ctaState}`}
          >
            Get a Quote
          </a>

          {/* Mobile hamburger — 44px tap target */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border md:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-text transition-all duration-300 ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-text transition-opacity duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-text transition-all duration-300 ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-border bg-bg/95 backdrop-blur-md md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-base font-medium text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>

    {/* Mobile counterpart: slides up from the bottom on the same gate, so it
        never covers the hero on first paint. */}
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 p-3 backdrop-blur transition-all duration-700 ease-out md:hidden ${
        pastHero ? "visible translate-y-0" : "invisible translate-y-full"
      }`}
    >
      <a
        href="#contact"
        className="glow flex h-12 w-full items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary text-base font-semibold text-bg"
      >
        Get a Quote
      </a>
    </div>
    </>
  );
}
