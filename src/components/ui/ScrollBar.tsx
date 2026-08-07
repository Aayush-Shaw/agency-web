"use client";

import { useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

/**
 * The scrollbar, replacing the native one.
 *
 * Native scrollbars are laid out *inside* the viewport on Windows and Linux, so
 * keeping one costs ~15px off the right of every section — see the note in
 * globals.css. This is an overlay instead: no layout width, and it carries the
 * brand colour, which a native bar can only half do.
 *
 * The thumb's *position* is not set here. It comes from a scroll-driven CSS
 * animation, so it runs off the main thread and needs no scroll listener; this
 * file only turns pointer input into a scroll position and lets the animation
 * follow. That is also why dragging feels exact — the thumb is showing the real
 * scroll offset, not a JS estimate of it.
 *
 * window.scrollTo rather than the Lenis instance: Lenis only writes scroll while
 * one of its own animations is running, and its native-scroll listener adopts
 * any outside write. So a drag needs no handle on it. The one seam is grabbing
 * the thumb mid-wheel-glide, where Lenis is still animating and wins for the
 * ~1s it takes to settle.
 */

/** Thumb length. The one number both halves need — CSS sizes the thumb from
    it, the drag subtracts it from the track — so it goes out as a custom
    property rather than being written twice. Everything else about the
    geometry is measured, never assumed. */
const THUMB = 56;
/** One click of a step arrow — roughly three lines of body copy. */
const STEP = 64;
/** Hold-to-repeat, shaped like a key repeat: a pause to prove it is a hold,
    then a steady tick. Without it a held arrow reads as broken. */
const REPEAT_DELAY = 300;
const REPEAT_EVERY = 40;

const maxScroll = () =>
  document.documentElement.scrollHeight - window.innerHeight;

/** Solid triangle, the shape a step arrow has always been — with the corners
    taken off, which at this size is the difference between a mark and three
    needles.

    Fill plus a round-joined stroke in the same colour is what rounds them:
    the path is drawn inset by half the stroke width and the stroke puts the
    edges back where the sharp triangle had them, so the glyph keeps its
    footprint and only the corners change. A rounded outline drawn by hand
    would be six arcs to maintain instead. */
const Arrow = ({ up }: { up?: boolean }) => (
  <svg
    viewBox="0 0 8 5"
    className={`w-2 ${up ? "" : "rotate-180"}`}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 1 7 4.1H1z" />
  </svg>
);

export default function ScrollBar() {
  const track = useRef<HTMLDivElement>(null);

  /* Pointer position → document scroll, given where inside the thumb it was
     grabbed. The exact inverse of the scrollbar-thumb keyframe, and it stays
     that way by measuring the same box the keyframe's 100cqh resolves against
     rather than recomputing it from window.innerHeight — those two disagree
     while a mobile address bar is collapsing and whenever a horizontal
     scrollbar exists. */
  const scrollFor = (clientY: number, grab: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return 0;
    const travel = box.height - THUMB;
    if (travel <= 0) return 0;
    const t = (clientY - box.top - grab) / travel;
    return Math.min(Math.max(t, 0), 1) * maxScroll();
  };
  // Drag. Pointer capture is what makes releasing outside the window — or off
  // the 14px column — still end the drag on this element.
  const onThumbDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Or the track underneath would also jump on the same press.
    e.stopPropagation();
    const el = e.currentTarget;
    const grab = e.clientY - el.getBoundingClientRect().top;
    el.setPointerCapture(e.pointerId);

    const move = (ev: globalThis.PointerEvent) =>
      window.scrollTo({ top: scrollFor(ev.clientY, grab), behavior: "instant" });
    const end = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  };

  // Press the track: centre the thumb on the press. Jump-to-position rather
  // than the old page-at-a-time, which is what every current platform does.
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) =>
    window.scrollTo({ top: scrollFor(e.clientY, THUMB / 2), behavior: "instant" });

  const onArrowDown =
    (dir: 1 | -1) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);

      const step = () => window.scrollBy({ top: dir * STEP, behavior: "instant" });
      step();

      let every: ReturnType<typeof setInterval> | undefined;
      const delay = setTimeout(() => {
        every = setInterval(step, REPEAT_EVERY);
      }, REPEAT_DELAY);
      const end = () => {
        clearTimeout(delay);
        clearInterval(every);
        el.removeEventListener("pointerup", end);
        el.removeEventListener("pointercancel", end);
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    };

  return (
    // aria-hidden, and the arrows are divs rather than buttons on purpose: this
    // duplicates scrolling the page, which the keyboard already does natively.
    // Two real buttons here would put two tab stops in front of every page for
    // a function Space and PageDown already cover.
    <div
      className="scrollbar"
      aria-hidden="true"
      style={{ "--sb-thumb": `${THUMB}px` } as CSSProperties}
    >
      <div className="scrollbar-arrow" onPointerDown={onArrowDown(-1)}>
        <Arrow up />
      </div>

      <div ref={track} className="scrollbar-track" onPointerDown={onTrackDown}>
        <div className="scrollbar-thumb" onPointerDown={onThumbDown} />
      </div>

      <div className="scrollbar-arrow" onPointerDown={onArrowDown(1)}>
        <Arrow />
      </div>
    </div>
  );
}
