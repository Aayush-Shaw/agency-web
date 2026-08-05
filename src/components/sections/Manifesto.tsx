"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Words from "@/components/ui/Words";

/**
 * Section 3 — a single bold statement that turns over word by word as you
 * scroll through it, the way a departure board flips.
 *
 * Scrubbed rather than triggered: the sentence is tied to scroll position, so
 * reading pace and scroll pace are the same thing, and scrolling back up
 * un-reads it. Squarely GSAP's half of the split — ScrollTrigger's scrub is
 * already driven by the same Lenis-fed ticker as everything else on the page.
 */
export default function Manifesto() {
  const root = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The perspective lives on the paragraph, not on each word, so every
        // word turns toward one shared vanishing point instead of each flipping
        // in its own little world. transformOrigin is set rather than tweened:
        // it is the hinge the rotation swings on and never changes.
        gsap.set(root.current, { perspective: 800 });
        gsap.set(".mf-word", { transformOrigin: "50% 0%" });

        // Words render upright and at full opacity by default, so no-JS and
        // reduced-motion readers get a plain paragraph. fromTo only tips them
        // over once it runs.
        gsap.fromTo(
          ".mf-word",
          { rotationX: -92, y: -12, opacity: 0.15 },
          {
            rotationX: 0,
            y: 0,
            opacity: 1,
            ease: "none",
            duration: 1,
            // Under scrub the whole tween is mapped onto the scroll range, so
            // these two numbers are ratios to each other, not seconds.
            stagger: 0.3,
            scrollTrigger: {
              trigger: root.current,
              start: "top 80%",
              end: "bottom 55%",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    // id purely so the hero's scroll hint has the *next* section to aim at —
    // #services would skip this one, which is not what a "scroll down" arrow
    // promises. Not in the navbar; nothing else links here.
    <section id="manifesto" className="px-5 pt-35 pb-10 md:px-8">
      <p
        ref={root}
        className="mx-auto max-w-4xl text-center text-statement font-semibold leading-snug tracking-tight"
      >
        <Words
          className="mf-word"
          text="Most studios ship templates. We build brands that"
        />
        <span className="mf-word text-gradient inline-block">move</span>{" "}
        <Words
          className="mf-word"
          text="— every pixel, frame, and line of copy considered, so the work feels as sharp as the product behind it."
        />
      </p>
    </section>
  );
}
