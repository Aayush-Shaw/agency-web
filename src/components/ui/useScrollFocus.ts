"use client";

import { useEffect, type RefObject } from "react";

/**
 * The touch counterpart to hover: on a phone the scroll position is the cursor.
 *
 * Marks whichever item is crossing the viewport's middle with `data-focus`, so
 * the same things a mouse reveals on hover can be revealed by scrolling to
 * them. Call sites pair every `group-hover:` with a `group-data-[focus]:` twin.
 *
 * `rootMargin: -50% 0px -50%` collapses the observer's root to a zero-height
 * line across the middle of the viewport, so "intersecting" means "touching
 * that line" - one item at a time, without measuring anything per frame.
 *
 * It latches: focus moves when something new starts intersecting and is never
 * cleared on exit. The gap between two cards is a stretch of scroll where
 * nothing is on the line, and clearing there would blink the whole section off
 * between every pair.
 *
 * Only runs where there is no hover to begin with, and watches that live rather
 * than reading it once - plug a mouse into a tablet and this turns itself off,
 * the same way CardRail watches for a fine pointer.
 *
 * The state is a DOM attribute rather than React state, for the reason the
 * theme and `data-past-hero` are: the things that read it are CSS, and lifting
 * it into React would re-render every card on every scroll to hand CSS a class
 * it could have read off the element itself.
 */
export default function useScrollFocus(
  container: RefObject<HTMLElement | null>,
  /** CSS selector for the focusable items, resolved inside `container`. */
  selector: string,
) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const touch = window.matchMedia("(hover: none)");
    let observer: IntersectionObserver | undefined;

    const items = () => root.querySelectorAll(selector);
    const clear = () => {
      for (const el of items()) el.removeAttribute("data-focus");
    };

    // Rebuilt rather than paused when the media query flips, so a device that
    // gains a mouse mid-session drops the attribute it was left holding.
    const sync = () => {
      observer?.disconnect();
      observer = undefined;
      clear();
      if (!touch.matches) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            clear();
            entry.target.setAttribute("data-focus", "");
          }
        },
        { rootMargin: "-50% 0px -50% 0px" },
      );
      for (const el of items()) observer.observe(el);
    };

    sync();
    touch.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      touch.removeEventListener("change", sync);
    };
  }, [container, selector]);
}
