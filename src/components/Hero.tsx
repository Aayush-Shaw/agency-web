"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Aurora from "@/components/Aurora";
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

  // One boolean, published as a DOM attribute rather than React state, for the
  // same reason the theme is: the two things that need it — the navbar's
  // borrowed dark palette and the WebGL backdrop's off switch — are both pure
  // CSS in globals.css, and neither is in this component's tree.
  //
  // scrollY >= the hero's own height is the moment the opaque stack above has
  // covered it completely. offsetHeight, not getBoundingClientRect: sticky
  // pins the visual box at the top but leaves the flow box (and so the height)
  // honest. Read per event, off an already-clean layout — the same passive
  // listener shape the navbar uses.
  //
  // data-overflows is the safety valve, and it has to be measured rather than
  // guessed at a breakpoint: a hero taller than the viewport can't be pinned
  // at top:0, because a sticky element never scrolls and so never reveals what
  // starts below the fold. globals.css unpins it. Also on resize, since that
  // is the one thing that changes the answer without a scroll.
  useEffect(() => {
    const sync = () => {
      const height = root.current?.offsetHeight ?? 0;
      document.documentElement.toggleAttribute(
        "data-past-hero",
        window.scrollY >= height
      );
      root.current?.toggleAttribute(
        "data-overflows",
        height > window.innerHeight
      );
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.documentElement.removeAttribute("data-past-hero");
    };
  }, []);

  // min-h-svh + items-center. A floor here used to be the wrong call for one
  // specific reason: the content was top-aligned, so every pixel the content
  // didn't use piled up as dead space at the bottom (337px of it on an iPad
  // mini). Centring is what answers that — the slack now splits above and
  // below the content instead of all landing under it.
  //
  // svh, not dvh: dvh tracks the mobile browser chrome collapsing on scroll,
  // which would resize the hero mid-scroll — and the hero's height is a live
  // input to two other things (Aurora re-syncs its drawing buffer on resize,
  // and the data-past-hero threshold below is measured off offsetHeight).
  // svh is the one that holds still.
  //
  // pb-8 is no longer load-bearing now that centring keeps the buttons off the
  // bottom edge, but it stays as the floor it was: the CTAs enter on y:24 and
  // carry a `glow` shadow that reaches ~32px past their box. With
  // overflow-hidden clipping the
  // section and Manifesto's opaque bg-surface starting the instant it ends,
  // zero bottom padding sliced the buttons mid-animation and cut their glow at
  // rest. This is the travel plus the shadow, nothing more.
  //
  // sticky top-0 with <main> as the containing block: the hero pins on the
  // first pixel of scroll and the rest of the page — one opaque z-10 stack in
  // page.tsx — travels up over it. Nothing animates, so there is no scrub to
  // fight native scroll on a phone; the whole effect is two z-indexes.
  //
  // theme-dark locks the section to the dark half of every token pair whatever
  // the site theme is. See the Hero stage block in globals.css for why it is a
  // class re-declaring the palette rather than a bare color-scheme.
  return (
    <section
      id="top"
      ref={root}
      className="theme-dark sticky top-0 z-0 flex min-h-svh items-center overflow-hidden px-5 pt-24 pb-8 short:pt-20 short:pb-6 md:px-8"
    >
      {/* Hero-only backdrop. It clears to the bg token (opaque), which under
          theme-dark is the dark one — so inside this section it stands in for
          the shared .atmosphere rather than layering over it. Content sits on
          z-10 above it; globals.css drops it entirely once the page is past
          the hero, which is what stops its render loop. */}
      <div
        aria-hidden
        className="hero-backdrop pointer-events-none absolute inset-0 z-0"
      >
        <Aurora
          colorStops={["#4f6793", "#223057", "#483f72"]}
          blend={0.5}
          amplitude={1.5}
          speed={0.8}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
        {/* text-balance, not a hard <br>: the break has to land in a different
            place on a phone than it does at 8xl, and letting the browser even
            the lines out is the only version that stays right at every width.
            It only engages under a handful of lines, which is the whole point
            of the headline being this short. */}
        {/* No short: cap on the size. It was capping the headline to the
            section-xl step on anything under 44rem tall, which is most
            laptops — and measured, the cap is only load-bearing below about
            520px of viewport height. At 600 and 700 the full size fits with
            66–116px to spare. Below ~520 the hero outgrows the viewport and
            data-overflows unpins it (see the effect above), which is the
            graceful path: the headline stays big and the CTAs stay reachable,
            the sticky overlap is what's traded away. */}
        <h1 className="mx-auto max-w-4xl text-balance text-display font-bold leading-[1.02] tracking-tight">
          <Words className="hero-word" text="We make brands" /><br />
          {/* Boxed per word so the tail joins the same stagger as everything
              above it, rather than fading in as one block. The cost is that
              `.text-gradient` clips its own background per box, so the
              honey→cinnamon ramp restarts on each of these three words instead
              of running once across the phrase. Per-word boxes are small
              enough to still wrap normally; it was boxing the *whole* phrase
              that used to cost the headline a line. The period rides inside
              the last box but outside the gradient span, so it stays
              text-coloured. */}
{/* 
          iOS glass alternative — swap these three in and comment the
              gradient ones below. .text-glass is still in globals.css. Each
              glyph becomes a cut-out onto the aurora, so unlike the gradient
              it doesn't restart per box; the period goes inside the glass
              because left solid against it, it reads as a stray white square. */}

          <span className="hero-word text-glass inline-block">impossible</span>{" "}
          <span className="hero-word text-glass inline-block">to</span>{" "}
          <span className="hero-word text-glass inline-block">ignore.</span>
         

          {/* <span className="hero-word text-gradient inline-block">
            impossible
          </span>{" "}
          <span className="hero-word text-gradient inline-block">to</span>{" "}
          <span className="hero-word inline-block">
            <span className="text-gradient">ignore</span>.
          </span> */}
        </h1>

        {/* The service list moved down here when the headline lost it — the
            headline now carries the promise and this carries the proof. */}
        <p className="hero-sub mx-auto mt-7 max-w-xl text-balance text-lead leading-relaxed text-text-muted short:mt-4 short:max-w-2xl short:max-sm:leading-snug">
          Digital Bear is a full-service studio crafting websites, social
          content, motion graphics, and AI-generated video for ambitious teams —
          premium work, fast turnarounds, on your timezone.
        </p>

        {/* Magnetic owns transform on the wrapper; GSAP's entrance owns it on
            the anchor inside. Two elements, so neither clobbers the other.
            justify-center only bites in the row direction — stacked on mobile
            the buttons are still w-full, and centring the cross axis there
            would shrink them to their text. */}
        <div className="mt-9 flex flex-col gap-3 short:mt-6 sm:flex-row sm:justify-center">
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
