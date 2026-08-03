import type { ReactNode } from "react";

/**
 * The hero CTA's arrow swap, in text: on hover the label rolls up out of a clip
 * and an identical copy rides in from below to take its place. Upward only —
 * the arrow's diagonal belt is the arrow's own thing.
 *
 * Nothing here is a trigger. The rules in globals.css hang off the nearest
 * `a:hover` / `button:hover` (and `:focus-visible`, so the keyboard sees it
 * too), which means a call site is one edit — wrap the label — and never a
 * `group` class the next person can forget. It also means a Roll inside a link
 * plays when *any* part of that link is hovered, padding included, which is the
 * behaviour you want and the reason this isn't self-hovering.
 *
 * The twin is aria-hidden: it is the same string a second time, and without it
 * every link on the site reads its own name twice.
 *
 * Wrap the label, not the control — the clip has to be the text's own box.
 * Given the whole <a> it would cut the padding, the border and any background
 * with it. Icons that ride alongside the label stay outside for the same
 * reason (see the navbar's claw, ScrollHint's arrow).
 */
export default function Roll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`roll ${className}`}>
      <span>{children}</span>
      <span className="roll-twin" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
