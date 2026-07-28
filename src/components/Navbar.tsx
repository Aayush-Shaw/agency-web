"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Surface-only: the pills are always mounted and always visible, so this
  // never gates display — it only decides transparent vs. frosted. A plain
  // passive listener, same as before: there's no scrub or timeline here, so
  // ScrollTrigger would be a second scroll system for one boolean.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // One shared surface so the separate pills read as a single bar that happens
  // to be split. Frost is token-driven (bg/border/glow), never a new colour.
  const pill = `rounded-full border transition-all duration-300 ${
    scrolled
      ? "border-border bg-bg/20 shadow-[0_6px_24px_-10px_var(--raw-glow)] backdrop-blur-sm"
      : "border-transparent bg-transparent"
  }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        {/* Left pill — logo only. */}
        <a
          href="#top"
          onClick={() => setMenuOpen(false)}
          className={`${pill} flex h-12 items-center gap-2.5 px-5 font-display text-lg font-bold tracking-tight`}
        >
          <span className="claw h-5 w-5" aria-hidden="true" />
          DIGITAL <span className="text-gradient">BEAR</span>
        </a>

        {/* Center pill — absolutely positioned so it centres on the page rather
            than on the space left over by its siblings; the logo can grow
            without dragging it off-centre. Reveals at lg, not md: a centred
            pill and the logo pill collide around 768px. */}
        <ul
          className={`${pill} absolute left-1/2 hidden h-12 -translate-x-1/2 items-center gap-6 px-6 lg:flex`}
        >
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

        {/* Right pill — controls. Same surface as the other two; the buttons
            inside are borderless so the pill supplies the only outline. */}
        <div className={`${pill} flex h-12 items-center gap-1 px-0.5`}>
          {/* Theme toggle. The DOM attribute is the state — no React state, so
              nothing to hydrate and the icon swap is pure CSS. */}
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileTap={{ scale: 0.85, rotate: -25 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            aria-label="Toggle light or dark theme"
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text"
          >
            <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
            <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
          </motion.button>

          {/* Hamburger — 44px tap target, hidden once the links pill appears. */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text lg:hidden"
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
          </motion.button>
        </div>
      </div>

      {/* Mobile menu panel — a pill-cornered card under the bar rather than a
          full-bleed drop-down, so it belongs to the floating pills above it.
          AnimatePresence is the point of using Framer here: it keeps the panel
          mounted long enough to play an exit, which a plain `menuOpen && ...`
          can't do — it used to just vanish. */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            key="menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden px-5 md:px-8 lg:hidden"
          >
            <motion.ul
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
              }}
              className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-bg/90 px-5 py-2 backdrop-blur-xl"
            >
              {LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    closed: { opacity: 0, x: -20 },
                    open: { opacity: 1, x: 0 },
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-base font-medium text-text"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
