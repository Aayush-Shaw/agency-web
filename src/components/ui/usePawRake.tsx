"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

/* The paw is heavy and lags behind the cursor; the light under it keeps up.
   That difference is the whole effect — matched springs would read as one
   cursor decoration, and the drag is what makes it feel like an animal's paw
   being pulled across the content rather than a shape parented to the pointer. */
const PAW = { stiffness: 110, damping: 17, mass: 1.1 };
const GLOW = { stiffness: 260, damping: 30, mass: 0.6 };
/* Softens the tilt, which is derived from velocity and so is noisy at source. */
const TILT = { stiffness: 190, damping: 26 };

/** The site's standard curve — see .lift in globals.css. */
const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

/**
 * The signature claw from every eyebrow on the site, scaled up and handed the
 * pointer: it trails the cursor on a loose spring and tilts into the direction
 * it is being dragged, so a fast swipe drags it sideways and a stop lets it
 * settle back level. A warm light rides underneath and keeps up, and that is
 * what actually picks content out — the claw is a mark, not a lamp.
 *
 * A hook returning a layer rather than a wrapper component, because the two
 * places that rake want different boxes around them: the FAQ has a plain div to
 * hang it on, and a review card is already a positioned element with its own
 * pointer handler (the tilt spring) and its own clip. A component would have
 * meant a second box inside the card that could only ever be `absolute inset-0`
 * of the one already there.
 *
 * Mount `layers` inside any `position: relative` element and call `track` from
 * its onPointerMove / `stop` from its onPointerLeave. The box that receives
 * those events is the box the paw is measured against and clipped to, so
 * putting them on a card clips the rake to that card — rounded corners
 * included, since the clip is the caller's own `overflow-hidden`.
 *
 * `layers` paints at z-0; content that should stay clear of the paw asks for it
 * with `relative z-10`. Fine pointers only, for the reason Magnetic.tsx gives:
 * on touch this would put a paw under the finger that is trying to press.
 */
export default function usePawRake() {
  const [raking, setRaking] = useState(false);
  const reduced = useReducedMotion();

  // Pointer position inside the raked box, in px from its top-left corner.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const pawX = useSpring(x, PAW);
  const pawY = useSpring(y, PAW);
  const glowX = useSpring(x, GLOW);
  const glowY = useSpring(y, GLOW);

  // Velocity of the *sprung* x, not the raw pointer: a mousemove stream is
  // stepwise and its derivative jumps, while the spring has already smoothed it.
  const tilt = useSpring(
    useTransform(useVelocity(pawX), [-2200, 2200], [-26, 26]),
    TILT,
  );

  const track = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    // currentTarget, so the box is whatever element the handler was put on —
    // that is what makes this measure against a card in one place and the whole
    // ledger in the other without being told which.
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = event.clientX - rect.left;
    const ny = event.clientY - rect.top;
    // First frame of a hover: jump rather than spring, or the paw streaks in
    // from the box's top-left corner every time the cursor enters — a swipe
    // nobody made.
    if (!raking) {
      pawX.jump(nx);
      pawY.jump(ny);
      glowX.jump(nx);
      glowY.jump(ny);
      setRaking(true);
    }
    x.set(nx);
    y.set(ny);
  };

  const layers = reduced ? null : (
    // The clip goes on a layer of its own rather than on the caller's box.
    // Both marks are drawn from the cursor's position and reach well past it —
    // the glow by 160px, the paw by 56 — so without one they rake on over
    // whatever sits beside the content.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <motion.span
        style={{ x: glowX, y: glowY }}
        animate={{ opacity: raking ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="absolute left-0 top-0 -ml-40 -mt-40 size-80 rounded-full bg-accent-primary/20 blur-3xl"
      />
      {/* .claw sizes itself at 1em and is unlayered, so it outranks any size-*
          utility (same cascade note as :focus-visible in globals.css) —
          font-size is the handle on how big it gets. */}
      <motion.span
        style={{ x: pawX, y: pawY, rotate: tilt }}
        animate={{ opacity: raking ? 0.45 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="claw absolute left-0 top-0 -ml-14 -mt-14 text-[7rem]"
      />
    </div>
  );

  return { track, stop: () => setRaking(false), layers };
}
