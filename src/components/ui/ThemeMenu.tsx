"use client";

import { Check, Palette } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Theme picker for the navbar.
 *
 * The state is the `data-theme` attribute on <html> — same as it always was —
 * so this component holds no theme of its own. It writes the attribute on a
 * pick and watches it for everything else, which is what keeps it honest when
 * something *outside* it changes the theme: the <head> script on load, and the
 * OS-preference listener in Navbar.tsx, both of which still own their halves.
 *
 * Nothing is persisted, deliberately. A pick lasts the session; a reload
 * re-resolves from the device. See the note on the <head> script in layout.tsx.
 */

/** Each swatch is base → primary accent → secondary accent, which is the same
    three roles globals.css assigns for that theme. Literal hex rather than the
    tokens, because a swatch has to show a palette the page is *not* currently
    wearing. Keep in step with the [data-theme] blocks in globals.css. */
const THEMES = [
  { id: "light", label: "Light", swatch: ["#f3eee5", "#c9822e", "#a8502d"] },
  { id: "dark", label: "Dark", swatch: ["#2b1b12", "#e8a33d", "#c1633b"] },
  { id: "hiking", label: "Hiking", swatch: ["#f3eee5", "#8c5a5a", "#d08856"] },
  { id: "canada", label: "Canada", swatch: ["#f3eee5", "#8b1e2d", "#1b4332"] },
  { id: "mr-bean", label: "Mr. Bean", swatch: ["#f3eee5", "#6a1d20", "#b07d56"] },
  { id: "gucci", label: "Gucci", swatch: ["#dcd2c6", "#7b604a", "#f5d76e"] },
] as const;

const ITEM = "[role=menuitemradio]";

// A literal, not useId(): popovertarget is resolved with getElementById, and
// there is exactly one navbar on the page.
const MENU_ID = "theme-menu";

// Module scope, like the toggle this replaces, and for a reason the compiler
// enforces: react-hooks/immutability rejects a write to a value from outside
// the component made inside one. The write itself is the whole of "apply a
// theme" — [data-theme] is the state.
function applyTheme(id: string) {
  document.documentElement.dataset.theme = id;
}

export default function ThemeMenu() {
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Server-rendered null and filled in after hydration, so the checkmark can't
  // disagree with the markup React sent. A MutationObserver rather than a
  // setState next to every writer: three separate things set this attribute,
  // and watching it means none of them has to know this menu exists.
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setTheme(html.dataset.theme ?? null);
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // The popover attribute buys light dismiss (click outside), Escape, the top
  // layer, and focus returning to the button on close — all of it native, none
  // of it in this file. What is left is: mirror the open state back for
  // aria-expanded, put the panel under its button, and move focus in.
  //
  // Position is measured rather than declared because the navbar is centred
  // inside a max-w-[1600px] band, so past that width the button is nowhere near
  // the viewport's right edge. A top-layer element has no ancestor to be
  // absolute against, so this is the arithmetic that replaces one.
  // clientWidth, not innerWidth: the scrollbar is not part of the box a fixed
  // element's `right` is measured from.
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      const isOpen = (e as Event & { newState?: string }).newState === "open";
      setOpen(isOpen);
      if (!isOpen) return;
      const r = btn.current?.getBoundingClientRect();
      if (r) {
        el.style.top = `${r.bottom + 12}px`;
        el.style.right = `${document.documentElement.clientWidth - r.right}px`;
        el.style.left = "auto";
        el.style.bottom = "auto";
      }
      // Opening a menu lands you on the current choice, not at the top of the
      // list — the arrow keys below then read as moving away from where you are.
      const items = el.querySelectorAll<HTMLButtonElement>(ITEM);
      (el.querySelector<HTMLButtonElement>(`${ITEM}[aria-checked=true]`) ??
        items[0])?.focus();
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, []);

  const pick = (next: string) => {
    applyTheme(next);
    menu.current?.hidePopover();
  };

  // Roving focus. A menu is one tab stop with arrow keys inside it, not six tab
  // stops — every item is tabindex=-1 (below) and focus is only ever moved
  // programmatically, so Tab leaves the menu instead of walking it. Tab closing
  // is the other half of that: focus landing behind an open popover is what the
  // menu pattern exists to prevent.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") return menu.current?.hidePopover();
    const items = [...(menu.current?.querySelectorAll<HTMLButtonElement>(ITEM) ?? [])];
    if (!items.length) return;
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => {
      e.preventDefault();
      items[(i + items.length) % items.length].focus();
    };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
  };

  return (
    <>
      <motion.button
        ref={btn}
        type="button"
        popoverTarget={MENU_ID}
        whileTap={{ scale: 0.85, rotate: -25 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        aria-label="Choose a theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full text-text transition-colors md:text-text-muted md:hover:text-text"
      >
        <Palette className="h-5 w-5" aria-hidden="true" />
      </motion.button>

      {/* m-0 and the inline inset above override the UA's `inset:0; margin:auto`,
          which would otherwise centre this in the viewport. The frost matches
          the navbar's own pills, and inherits the hero's dark palette for as
          long as the header is still over the hero — see globals.css. */}
      <div
        ref={menu}
        id={MENU_ID}
        popover="auto"
        role="menu"
        aria-label="Theme"
        onKeyDown={onKeyDown}
        className="m-0 w-56 rounded-2xl border border-border bg-bg/80 p-1.5 text-text shadow-[0_24px_60px_-24px_var(--raw-glow)] backdrop-blur-md"
      >
        {THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              tabIndex={-1}
              onClick={() => pick(t.id)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-surface focus-visible:bg-surface"
            >
              {/* Three wedges of the theme's own palette. A dot per colour would
                  be three more boxes to align; one gradient is the same
                  information in one box. */}
              <span
                aria-hidden="true"
                className="h-5 w-5 shrink-0 rounded-full border border-border"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${t.swatch[0]} 0 34%, ${t.swatch[1]} 34% 67%, ${t.swatch[2]} 67%)`,
                }}
              />
              <span className="flex-1">{t.label}</span>
              {/* Always in the layout, never conditionally rendered: a check
                  that appears would shove the label sideways on every pick. */}
              <Check
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-accent-primary transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
