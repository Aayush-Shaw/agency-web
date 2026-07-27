"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

/**
 * Magnetic hover: the wrapped control drifts toward the cursor and springs
 * back when it leaves.
 *
 * This is Framer's half of the split, not GSAP's — it's pointer-driven rather
 * than scroll-driven, and the spring has to survive being retargeted every
 * mousemove without restarting. GSAP would need a tween per frame for this.
 *
 * The wrapper owns `transform`; whatever is inside it stays free for CSS
 * hover/scale and for GSAP entrance tweens, so nothing fights over the
 * same property.
 */
export default function Magnetic({
  children,
  className = "",
  /** Fraction of the cursor's offset from centre that the control follows. */
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 260, damping: 20, mass: 0.6 };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className}`}
      style={{ x: useSpring(x, spring), y: useSpring(y, spring) }}
      onPointerMove={(e) => {
        // Fine pointers only: on touch this would drag the button away from
        // the finger that's trying to press it.
        if (reduced || e.pointerType !== "mouse" || !ref.current) return;
        const box = ref.current.getBoundingClientRect();
        x.set((e.clientX - (box.left + box.width / 2)) * strength);
        y.set((e.clientY - (box.top + box.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
