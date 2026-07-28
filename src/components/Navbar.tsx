"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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

  // Tap outside the bar to dismiss. pointerdown rather than click so the menu
  // is already closing as the finger lands, and it fires for touch and mouse
  // alike. menuOpen is only ever true below md, where the header *is* the box.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  const surface = scrolled
    ? "border-border bg-bg/20 shadow-[0_6px_24px_-10px_var(--raw-glow)] backdrop-blur-sm"
    : "border-transparent bg-transparent";

  // One shared surface so the separate pills read as a single bar that happens
  // to be split. Frost is token-driven (bg/border/glow), never a new colour.
  const pill = `rounded-full border transition-all duration-300 ${surface}`;

  // Open below md, the whole bar becomes one box, so the pills inside give up
  // their own surface — otherwise every control reads as a pill inside a pill.
  const pillInBox = `${pill} max-md:border-transparent max-md:bg-transparent max-md:shadow-none max-md:backdrop-blur-none`;
  const control = menuOpen ? pillInBox : pill;

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 px-5 py-3 md:px-8"
    >
      {/* The morphing container. Below md it owns the rounded box that the menu
          expands inside; at md and up it is a bare positioning context for the
          centred links pill. The transparent border is always present so that
          turning it visible costs no layout shift. Radius comes from the same
          --radius token as the cards, squircled to match them. */}
      <div
        className={`relative mx-auto max-w-6xl transition-all duration-500 max-md:overflow-hidden max-md:rounded-(--radius) max-md:border max-md:[corner-shape:squircle] ${
          menuOpen
            ? "max-md:border-border max-md:bg-bg/20 max-md:shadow-[0_18px_50px_-18px_var(--raw-glow)] max-md:backdrop-blur-sm"
            : "max-md:border-transparent"
        }`}
      >
        {/* Top row. Gains inner padding once open so the controls sit inside
            the box rather than flush against its edge. */}
        <div
          className={`relative flex items-center justify-between transition-all duration-300 ${
            menuOpen ? "max-md:p-3" : ""
          }`}
        >
          {/* Left pill — logo only. */}
          <a
            href="#top"
            onClick={() => setMenuOpen(false)}
            className={`${control} flex h-12 items-center gap-2 px-3 font-display text-base font-bold tracking-tight lg:gap-2.5 lg:px-5 lg:text-lg`}
          >
            <span className="claw h-5 w-5" aria-hidden="true" />
            DIGITAL <span className="text-gradient">BEAR</span>
          </a>

          {/* Center pill — absolutely positioned so it centres on the page rather
              than on the space left over by its siblings; the logo can grow
              without dragging it off-centre.

              That independence is also why it has to shrink at md: page-centred
              means the pill grows equally in both directions, so at 768px a
              full-size one (371px) would reach back to x=191 while the
              full-size logo still runs to x=218 — they overlap. The tighter
              gap/padding here and the compact logo above (both until lg) buy
              that clearance back instead of moving the pill off-centre. */}
          <ul
            className={`${pill} absolute left-1/2 hidden h-12 -translate-x-1/2 items-center gap-3 px-4 md:flex lg:gap-6 lg:px-6`}
          >
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block py-3 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Both controls share one pill instead of carrying their own. The
              buttons inside are borderless so the pill supplies the only
              outline, and it still collapses to a single circle at md where the
              hamburger drops out. */}
          <div className={`${control} flex h-12 items-center gap-1 px-0.5`}>
            {/* Theme toggle. The DOM attribute is the state — no React state, so
                nothing to hydrate and the icon swap is pure CSS. */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileTap={{ scale: 0.85, rotate: -25 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              aria-label="Toggle light or dark theme"
              className="flex h-11 w-11 items-center justify-center rounded-full text-text transition-colors md:text-text-muted md:hover:text-text"
            >
              <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
              <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
            </motion.button>

            {/* Hamburger → X. Two bars, not three: the middle one only exists to
                be faded out, and these two already cross into the X on their
                own. Both stay centred and just rotate, so there is nothing to
                keep in sync. */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            >
              <span
                className={`absolute h-0.5 w-4.5 rounded-full bg-text transition-transform duration-300 ${
                  menuOpen ? "rotate-45" : "-translate-y-1"
                }`}
              />
              <span
                className={`absolute h-0.5 w-4.5 rounded-full bg-text transition-transform duration-300 ${
                  menuOpen ? "-rotate-45" : "translate-y-1"
                }`}
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile menu — a two-column grid inside the same box, revealed by
            animating max-height. Always mounted, so the exit plays on its own
            without AnimatePresence keeping a removed subtree alive. max-h-40
            clears the two rows four links produce; kept close to the real
            height on purpose, since the gap between the ceiling and the content
            is time the transition spends animating nothing. */}
        <div
          className={`hidden overflow-hidden px-3 transition-all duration-500 ease-in-out max-md:block ${
            menuOpen ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 gap-1 text-center">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? undefined : -1}
                className="rounded-full px-3 py-2.5 text-sm font-medium text-text"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
