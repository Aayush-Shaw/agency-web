"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Magnetic from "@/components/Magnetic";
import Words from "@/components/Words";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // The page's one real timeline: each beat overlaps the one before it, so the
  // hero arrives as a single move rather than three separate fades. Durations
  // come from gsap.defaults() (0.9s power3.out) — the timing measured off the
  // reference sites.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // fromTo, not from — see the note in Reveal.tsx.
        const tl = gsap.timeline({ delay: 0.15 });

        tl
          // Words tip up off their baseline, pivoting at the bottom edge rather
          // than spinning around their middle.
          //
          // transformPerspective (per word), NOT `perspective` on the h1: a
          // parent perspective gives every word one shared vanishing point at
          // the h1's centre, so the further a word sits from that centre the
          // more its projection slides sideways as it rotates. On a three-line
          // headline that threw the first word of the last line clear off the
          // left edge, where the section's overflow-hidden clipped it. Per-word
          // perspective pivots each word about its own box — no lateral drift.
          //
          // stagger vs duration is what makes this read as one-by-one rather
          // than one wave: at the old 0.045/1.1 every word was already moving
          // within 0.45s, so they arrived as a block. The gap is now a real
          // fraction of the travel, and each word clearly follows the last.
          .fromTo(
            ".hero-word",
            { opacity: 0, yPercent: 120, rotateX: -75, transformPerspective: 800 },
            {
              opacity: 1,
              yPercent: 0,
              rotateX: 0,
              transformPerspective: 800,
              duration: 0.85,
              stagger: 0.09,
              transformOrigin: "50% 100%",
            }
          )
          .fromTo(".hero-sub", { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, "-=0.6")
          .fromTo(
            ".hero-cta",
            { opacity: 0, y: 24 },
            // clearProps for the same reason as Reveal: the buttons' CSS
            // hover:scale is dead while GSAP's inline transform sits on them.
            // transform only, not "all": the pre-hide in globals.css leaves
            // .hero-cta at opacity 0, so clearing the inline opacity too would
            // hand the buttons straight back to that rule and hide them.
            { opacity: 1, y: 0, stagger: 0.1, clearProps: "transform" },
            "-=0.7"
          );
      });
    },
    { scope: root }
  );

  // No min-height at all: the hero is exactly its content plus padding. Any
  // floor here — min-h-dvh, or the 860px cap that replaced it — is height the
  // content doesn't use, and with the content top-aligned every pixel of it
  // piled up at the bottom (337px of it on an iPad mini). Height now tracks
  // content on every device instead of the viewport.
  //
  // pb-8 is not spare space: the CTAs enter on y:24 and carry a `glow` shadow
  // that reaches ~32px past their box. With overflow-hidden clipping the
  // section and Manifesto's opaque bg-surface starting the instant it ends,
  // zero bottom padding sliced the buttons mid-animation and cut their glow at
  // rest. This is the travel plus the shadow, nothing more.
  return (
    <section
      id="top"
      ref={root}
      className="relative overflow-hidden px-5 pt-24 pb-8 md:px-8"
    >
      {/* Backdrop lives in the root layout (.atmosphere) — fixed, ratio 0,
          shared by every section rather than owned by the hero. */}

      <div className="mx-auto w-full max-w-6xl">
        <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <Words
            className="hero-word"
            text="Design, motion & AI video that makes brands"
          />
          {/* Boxed per word so the tail joins the same stagger as everything
              above it, rather than fading in as one block. The cost is that
              `.text-gradient` clips its own background per box, so the
              honey→cinnamon ramp now restarts on each of these three words
              instead of running once across the phrase. Per-word boxes are
              small enough to still wrap normally; it was boxing the *whole*
              phrase that used to cost the headline a line. The period rides
              inside the last box but outside the gradient span, so it stays
              text-coloured exactly as before. */}
          <span className="hero-word text-gradient inline-block">
            impossible
          </span>{" "}
          <span className="hero-word text-gradient inline-block">to</span>{" "}
          <span className="hero-word inline-block">
            <span className="text-gradient">ignore</span>.
          </span>
        </h1>

        <p className="hero-sub mt-7 max-w-xl text-lg leading-relaxed text-text-muted md:text-xl">
          Digital Bear is a full-service studio crafting websites, social
          content, motion graphics, and AI-generated video for ambitious teams —
          premium work, fast turnarounds, on your timezone.
        </p>

        {/* Magnetic owns transform on the wrapper; GSAP's entrance owns it on
            the anchor inside. Two elements, so neither clobbers the other. */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Magnetic className="w-full sm:w-auto">
            <a
              href="#contact"
              className="hero-cta glow inline-flex h-13 w-full items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary px-7 text-base font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Start a project
            </a>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <a
              href="#work"
              className="hero-cta inline-flex h-13 w-full items-center justify-center rounded-full border border-border px-7 text-base font-semibold text-text transition-colors hover:border-accent-primary hover:text-accent-primary"
            >
              See our work
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
