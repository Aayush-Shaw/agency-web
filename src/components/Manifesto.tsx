"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Words from "@/components/Words";

/**
 * Section 3 — a single bold statement that lights up word by word as you
 * scroll through it.
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
        // Words render at full opacity by default, so no-JS and reduced-motion
        // readers get a plain paragraph. fromTo only dims them once it runs.
        gsap.fromTo(
          ".mf-word",
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            duration: 1,
            // Under scrub the whole tween is mapped onto the scroll range, so
            // these two numbers are ratios to each other, not seconds.
            stagger: 0.4,
            scrollTrigger: {
              trigger: root.current,
              start: "top 80%",
              end: "bottom 60%",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section className="bg-surface px-5 py-24 md:px-8 md:py-36">
      <p
        ref={root}
        className="mx-auto max-w-4xl text-center text-3xl font-semibold leading-snug tracking-tight sm:text-4xl md:text-5xl"
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
