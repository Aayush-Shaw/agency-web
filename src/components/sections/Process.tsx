"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import ScrollHint from "@/components/ui/ScrollHint";

/* Stage content. Position on the dial is the array index - index 0 rests at 12
   o'clock, and each step after it sits SPAN degrees further round. Add or
   remove a stage and the geometry, the scroll length and the wrap all re-solve
   on their own; nothing below hardcodes "four". */
const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "We dig into your goals, audience, and market, then agree on scope, timeline, and what success looks like.",
  },
  {
    n: "02",
    title: "Design",
    body: "Concepts, direction, and prototypes. You see and shape the work early - no big reveals, no surprises.",
  },
  {
    n: "03",
    title: "Build",
    body: "We produce the final assets - site, design, content, or video - with regular check-ins and fast revisions.",
  },
  {
    n: "04",
    title: "Launch",
    body: "We ship, QA, and hand over clean files. Then we stay on to measure, iterate, and help you grow.",
  },
];

/** Degrees between neighbouring stages. 90° for four. */
const SPAN = 360 / STEPS.length;

/* Total travel. STEPS.length - 1, not STEPS.length: the dial stops with the
   last stage at the apex rather than carrying it round to the first again. A
   full 360 would put Discover back at 12 o'clock at the bottom of the section,
   which reads as "nothing happened" and gives the pin no ending. Holding on
   Launch is also the cheaper wrap - there is no seam to hide, because the dial
   never crosses one. */
const TURN = SPAN * (STEPS.length - 1);

const RAD = Math.PI / 180;

/* Pre-measure fallback only: `solve` overwrites all three in px on the first
   layout pass, off the heights it can actually see. */
const DIAL = {
  "--cy": "60svh",
  "--ry": "26svh",
  "--pad": "5rem",
} as React.CSSProperties;

/* Air, in px. */
const LEAD = 20; // heading to the top of the dial
const EDGE = 24; // section's bottom edge to the ends of the arc
const MIN_RY = 48; // below this the arc stops reading as an arc at all
const NAV = 80; // fixed navbar this section scrolls under, = pt-20

/* How close to a stage counts as being *on* it, as a fraction of one step.
   Only the Scroll button reads this, and only to answer "next from where?".
   Nothing snaps the dial, so it can rest anywhere between two stages, and the
   two failure modes sit on either side of this number: too small and pressing
   Scroll at 0.97 of the way to Design advances to Design, which is a rotation
   you cannot see; too large and it skips one. A tenth of a step is close
   enough to the apex to be reading that stage's text. */
const SETTLED = 0.1;

/**
 * Section 7 - how we work, as a scroll-driven dial.
 *
 * The four stages ride an arc that turns 90° per scroll-step, so whichever one
 * is "now" is the one at the apex. Direction is the one the brief describes
 * point-by-point (3 o'clock swings *up* to 12, the outgoing stage leaves past
 * the top-left) - anticlockwise on a real clock face, so the stages move the
 * way the brief says rather than the way the word "clockwise" says.
 *
 * A stage is a numbered marker with its title and description hanging directly
 * underneath it, and the whole thing rides the arc as one piece - text
 * included. Nothing is parked in a fixed spot and cross-faded in place; the
 * only reason opacity is here at all is that four of these share one arc, so
 * each has to be gone before the next is legible.
 *
 * Scroll is not the only way to drive it. The numbers are buttons and the
 * Scroll pill knows where the dial has got to, but neither of them animates it:
 * both scroll the page to where the stage they want sits at the apex and let
 * the scrub do the turning - see the block above `scrollToStep`. Only the
 * stages you can actually see are reachable, which is a property of the dial
 * rather than a rule enforced anywhere: the marker opposite the apex is at
 * opacity 0, and autoAlpha hides it from the pointer and the tab order with it.
 *
 * The layout solves itself from measured heights every refresh, which is what
 * lets one design cover a 320x568 phone and a 1920x1080 monitor:
 *
 *   · the dial starts LEAD px under the heading - a fixed, small gap, never a
 *     share of the leftover space;
 *   · the arc takes the room that is left, capped at rx so a tall narrow
 *     viewport gets a dome rather than a pointed arch;
 *   · whatever is still spare is split evenly above and below the *group*, so
 *     the heading and the dial travel together instead of the heading pinning
 *     to the top and the dial sinking away from it.
 *
 * That last point is the whole reason the gap under the heading used to be
 * enormous on a tall phone: the arc was anchored to the bottom of the section
 * and its height was a fraction of the viewport, so every pixel of surplus
 * landed in one place - between the heading and the apex.
 *
 * There is no reduced-motion branch. It was here, and it was removed on
 * request: this is now the only layout, so a stacked list only ever appears if
 * JavaScript has not run at all - which is not a fallback anyone chose, just
 * the markup before `.arc` is applied.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const arc = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLDivElement>(null);
  /* Assigned by the effect, called from the markup. The two controls need the
     live ScrollTrigger to turn a stage index into a scroll position, and it
     only exists inside the effect - same reason CardRail hands its loop out
     through a ref rather than rebuilding it per render. */
  const goStep = useRef<(i: number) => void>(() => {});
  const goNext = useRef<() => void>(() => {});

  useGSAP(
    () => {
      const section = root.current;
      const guide = arc.current;
      if (!section || !guide || !head.current) return;

      section.classList.add("arc");

      const arms = gsap.utils.toArray<HTMLElement>(".proc-arm", section);
      const markers = gsap.utils.toArray<HTMLElement>(".proc-marker", section);
      const rings = gsap.utils.toArray<HTMLElement>(".proc-ring", section);
      const panels = gsap.utils.toArray<HTMLElement>(".proc-panel", section);
      const hint = gsap.utils.toArray<HTMLElement>(".proc-hint", section);

      // Centring is GSAP's rather than a -translate-x-1/2 class: GSAP writes
      // `translate: none` on anything it transforms, and would wipe the class
      // the first time it touched either element.
      gsap.set(markers, { xPercent: -50, yPercent: -50 });
      gsap.set(panels, { xPercent: -50 });
      gsap.set(hint, { xPercent: -50 });

      let rx = 0;
      let ry = 0;

      /* Everything here is measured, nothing is a constant in a stylesheet.
         The heading is why: it is a px-sized block that wraps to more lines as
         the viewport narrows, so any svh expression for the dial is wrong at
         some size - and wrong means text on top of text. */
      const solve = () => {
        /* Back to the bare navbar clearance before anything is measured. --pad
           lands on the heading's own box, so leaving the last refresh's
           centring in place would fold it into offsetHeight and compound on
           every resize. */
        section.style.setProperty("--pad", `${NAV}px`);

        const cs = getComputedStyle(section);
        const H = section.offsetHeight;
        rx =
          (section.clientWidth -
            parseFloat(cs.paddingLeft) -
            parseFloat(cs.paddingRight)) /
          2;

        const markerR = (markers[0]?.offsetHeight ?? 0) / 2;

        // Straight off the heading's real box, padding included - so LEAD is
        // the gap you actually see, whether the heading wrapped to one line or
        // three.
        const apex =
          head.current!.offsetTop +
          head.current!.offsetHeight +
          LEAD +
          markerR;

        // The arc takes what is left, but never more than rx - an ellipse
        // taller than half its own width stops being a dome and becomes a
        // pointed arch, which on a 412x839 phone is a 571px parabola with the
        // stages strung along it. A semicircle is the ceiling.
        ry = Math.max(MIN_RY, Math.min(rx, H - EDGE - markerR - apex));

        /* What that cap leaves over. It is only ever non-zero on a viewport
           tall enough that a semicircle no longer reaches the bottom - which
           in practice means a phone; a wide one solves to 0 here and is
           untouched, so this needs no breakpoint of its own.
           Half goes above the heading and half stays under the arc, which
           centres heading and dial as one group. Splitting it is the point:
           given entirely to one end it reads as the section having slipped,
           and it was landing under the arc, leaving the heading jammed up
           against the navbar with a hole beneath the dial. The navbar
           clearance and EDGE are not part of the split - they are fixed
           obstacles, so the group centres in what is left between them. */
        const slack = Math.max(0, H - EDGE - markerR - apex - ry) / 2;

        section.style.setProperty("--pad", `${NAV + slack}px`);
        section.style.setProperty("--ry", `${ry}px`);
        section.style.setProperty("--cy", `${apex + slack + ry}px`);
      };

      const place = (progress: number) => {
        const turned = -TURN * progress;

        arms.forEach((arm, i) => {
          const deg = gsap.utils.wrap(0, 360, i * SPAN + turned);

          // One transform per stage, and the text is inside it - so the words
          // travel with their own number rather than sliding along some other
          // path of their own.
          gsap.set(arm, {
            x: rx * Math.sin(deg * RAD),
            y: -ry * Math.cos(deg * RAD),
          });

          // 0 at the apex, 180 straight down - same either way round, so a
          // stage looks identical arriving and leaving.
          const off = Math.min(deg, 360 - deg);

          gsap.set(markers[i], {
            scale: 1 - 0.25 * (off / 180),
            // Depth, then the horizon: gone by 105°, so a stage has vanished
            // before it would reach the bottom of the section.
            //
            // autoAlpha, not opacity: the marker is a button now, and the
            // curve reaches exactly 0 past 105°, so this hands the far side of
            // the dial `visibility: hidden` and takes those stages out of the
            // tab order with it. Left on opacity they would be invisible
            // controls you could still tab to and press.
            autoAlpha:
              (1 - 0.5 * (off / 180)) * gsap.utils.clamp(0, 1, (105 - off) / 15),
          });

          // One value drives the panel and the marker's ring, so the stage the
          // text belongs to is the one wearing the highlight by construction
          // rather than by two curves kept in step.
          //
          // Half a step is the *ceiling* on this window and is not taste: the
          // two nearest stages always have offsets summing to SPAN, so wider
          // than SPAN/2 and two blocks of text are legible on the arc at once.
          // A third is what it actually uses, which is: on a phone the text is
          // ~88vw, so it starts crossing the screen edge as soon as it travels
          // with its marker. Nothing can be both that wide and free to move, so
          // the text is gone by the time the clip would show - at a third of a
          // step it has only moved half its own width.
          const span = SPAN / 3;
          const near = gsap.utils.clamp(0, 1, (span - off) / span);
          // autoAlpha for the same reason as the marker, and here it fixes a
          // hit-testing bug rather than an a11y one: a panel is up to 32rem
          // wide and an opacity-0 element still takes clicks, so the faded
          // panels were lying across their neighbours' markers. Nothing
          // noticed while nothing on the dial was clickable.
          gsap.set(panels[i], { autoAlpha: near });
          gsap.set(rings[i], { opacity: near });
        });
      };

      const dial = { p: 0 };

      const spin = gsap.to(dial, {
        p: 1,
        ease: "none",
        onUpdate: () => place(dial.p),
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // One viewport of scroll per step, so the pace matches the rest of
          // the page rather than the number of stages.
          end: `+=${(STEPS.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            solve();
            place(dial.p);
          },
        },
      });

      const last = STEPS.length - 1;

      /* Both controls move the *page*, not the dial.
         The dial has exactly one input - this trigger's progress - so a tween
         written straight to `dial.p` would be overwritten by the scrub on the
         next scroll event, and the scroll position would still be sitting on
         the old stage underneath it. Scrolling to where the wanted stage rests
         at the apex turns the dial and leaves the pin, the progress and the
         scrollbar all agreeing, which also means the turn can be interrupted
         by a scroll mid-flight and nothing has to be unwound.
         scrub: 1 is what makes it read as a rotation rather than a jump: the
         dial trails the scroll by a second and keeps turning after it lands. */
      const scrollToStep = (i: number) => {
        const st = spin.scrollTrigger;
        if (!st) return;
        window.scrollTo({
          top: st.start + ((st.end - st.start) * gsap.utils.clamp(0, last, i)) / last,
          // Spelled out for the reason the old one-viewport nudge spelled it
          // out: the option outranks CSS scroll-behavior, which Lenis and the
          // reduced-motion reset both force to auto.
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
      };

      goStep.current = scrollToStep;

      goNext.current = () => {
        const st = spin.scrollTrigger;
        if (!st) return;
        // Which stage is at the apex right now. Off the trigger's own progress
        // and not `dial.p` - the scrub leaves that one deliberately lagging, so
        // pressing Scroll twice quickly would read the same stage both times
        // and ask for the same target twice.
        const here = Math.floor(st.progress * last + SETTLED);
        // Past the last stage there is no next one on the dial, so the button
        // goes back to meaning what it used to: one viewport, which carries you
        // off the end of the pin and on to the next section.
        if (here >= last) {
          window.scrollBy({
            top: window.innerHeight,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          });
          return;
        }
        scrollToStep(here + 1);
      };

      // The tween only calls onUpdate once it is moving, so without this the
      // first frame of the pin shows four stacked, unplaced stages.
      solve();
      place(0);

      // useGSAP reverts every tween and ScrollTrigger above; the class is ours.
      return () => section.classList.remove("arc");
    },
    { scope: root }
  );

  /* -mt + z-20 + an opaque background is the overlap with WhyUs above, which
     is sticky (see page.tsx) and so holds still underneath while this rides
     over it.

     `.arc` takes the vertical padding to zero rather than trimming it: the
     dial is positioned from the section's top edge, and `top` on an absolutely
     positioned child is measured from the *padding* box - leave py-32 on and
     the whole arc drops 128px below where --cy says it is. The heading takes
     over the top spacing, as --pad, which `solve` sets - see the slack split
     there for why it is not simply the navbar's height. */
  return (
    <section
      id="process"
      ref={root}
      style={DIAL}
      className="relative z-20 mt-[-10svh] overflow-hidden bg-bg px-5 py-24 [corner-shape:squircle] md:px-8 md:py-32 [&.arc]:h-svh [&.arc]:py-0"
    >
      {/* Clears the fixed navbar, which this section scrolls under rather than
          past - py-0 above took the section's own top padding away with it.
          --pad is that clearance plus whatever `solve` needs to add to centre
          the group vertically; it falls back to the bare NAV on the pass
          before the first measurement. */}
      <div ref={head} className="mx-auto max-w-[1600px] in-[.arc]:pt-(--pad)">
        <Reveal variant="words">
          <Eyebrow>How we work</Eyebrow>
          {/* Under `.arc` the heading stops being sized against width alone.
              --text-section is a vw clamp with no line-height of its own, so on
              a 320px phone it lands at its 36px floor and then inherits the
              body's 1.5 leading - 54px a line, 162px for three, which is 29% of
              a 568px screen spent on the heading. min(vw, svh) is the hero's own
              answer to the same problem: whichever axis is tighter wins, so this
              reads the same at 1440 and gets out of the way on a phone. */}
          <h2 className="mt-5 max-w-3xl text-section font-bold tracking-tight in-[.arc]:leading-[1.15]">
            A simple path from{" "}
            <span className="text-gradient">idea to launch</span>.
          </h2>
        </Reveal>
      </div>

      {/* The face: a top-half ellipse, --rx wide and --ry tall, with its flat
          edge on the centre line. The radius pair per corner (50%/100%) is what
          makes it an ellipse rather than two quarter-circles, and border-b-0 is
          what leaves the diameter undrawn - the arc is open at the ends, so
          nothing suggests a circle continuing below.

          inset-x-* re-applies the section's own gutter, and that inset is what
          --rx is solved against, so the arc is exactly as wide as the section
          minus its padding. */}
      <span
        ref={arc}
        aria-hidden="true"
        className="absolute inset-x-5 hidden h-(--ry) border border-b-0 border-border rounded-[50%_50%_0_0/100%_100%_0_0] md:inset-x-8 in-[.arc]:block in-[.arc]:top-[calc(var(--cy)-var(--ry))]"
      />

      {/* Zero-size, parked at the centre of the ellipse, so every stage inside
          is placed in plain (x, y) from there. Still an <ol> - the stages are a
          sequence whatever shape they are drawn in. */}
      <ol className="mx-auto mt-12 grid max-w-[1600px] gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 in-[.arc]:absolute in-[.arc]:left-1/2 in-[.arc]:top-(--cy) in-[.arc]:mt-0 in-[.arc]:block in-[.arc]:size-0">
        {STEPS.map((step, i) => (
          <li
            key={step.n}
            className="proc-point border-t border-border pt-5 in-[.arc]:absolute in-[.arc]:left-0 in-[.arc]:top-0 in-[.arc]:size-0 in-[.arc]:border-0 in-[.arc]:p-0"
          >
            {/* One moving piece per stage: the marker and its text together. */}
            <div className="proc-arm in-[.arc]:absolute in-[.arc]:left-0 in-[.arc]:top-0 in-[.arc]:size-0">
              {/* Tapping a number turns the dial to it, however far round it
                  is - the handler only names the stage, and the distance falls
                  out of where that stage sits on the scroll.

                  A button and not a div with a click: it is a control, and on
                  the dial it is also the only way to reach a stage without
                  scrolling. The label carries the title because the visible
                  text is "03", which on its own tells a screen reader nothing
                  about where it goes. Outside `.arc` (no JS, no dial) it is a
                  plain numeral again and pressing it does nothing, which is
                  the same deal every other control on the page makes. */}
              <button
                type="button"
                onClick={() => goStep.current(i)}
                aria-label={`Go to stage ${i + 1}, ${step.title}`}
                className="proc-marker font-display text-4xl font-bold text-gradient in-[.arc]:absolute in-[.arc]:left-0 in-[.arc]:top-0 in-[.arc]:grid in-[.arc]:size-10 in-[.arc]:cursor-pointer in-[.arc]:place-items-center in-[.arc]:rounded-full in-[.arc]:border in-[.arc]:border-border in-[.arc]:bg-surface in-[.arc]:text-sm"
              >
                {/* "You are here". A ring rather than a filled chip because the
                    numeral is gradient text - fill it and the two gradients sit
                    on top of each other. */}
                <span
                  aria-hidden="true"
                  className="proc-ring absolute inset-0 hidden rounded-full border-2 border-accent-primary in-[.arc]:block"
                />
                {step.n}
              </button>

              {/* Directly under its own number - top-8 is the marker's 20px
                  radius plus STACK. */}
              <div className="proc-panel in-[.arc]:absolute in-[.arc]:left-0 in-[.arc]:top-8 in-[.arc]:w-[min(32rem,88vw)] in-[.arc]:text-center">
                <h3 className="mt-3 text-card font-semibold tracking-tight in-[.arc]:mt-0">
                  {step.title}
                </h3>
                <p className="mt-2 leading-5 md:leading-relaxed text-text-muted in-[.arc]:text-text px-4 md:px-0">
                  {step.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Sits in the slack `solve` leaves under the arc, so it costs the dial
          nothing - and it is absolute, so it stays out of the height the arc is
          solved against.

          hidden until `.arc`, because without JS this section is a plain
          stacked list that scrolls like any other and has nothing to explain.
          The two variants are stacked (in-[.arc]:max-md:inline-flex) rather
          than written as `in-[.arc]:inline-flex md:hidden`: those two are the
          same specificity and would decide it on source order.

          inline-flex, not block - it has to restore the display ScrollHint
          sets for itself. Anything else here silently un-flexes the pill, and
          the label and arrow reflow as plain inline content and wrap onto two
          lines inside the border.

          A press lands the *next stage* on the apex - it reads where the dial
          has got to and aims at the stage after it, rather than adding a fixed
          viewport and hoping. The two only agree when you press it from a dead
          stop on a stage: pressing it having drifted two thirds of the way to
          Design used to leave you two thirds past Design, so the dial ended up
          resting between two stages with neither block of text legible, and
          every later press inherited the same offset. Past the last stage it
          means what it always did - see goNext.

          Not an href: the section is pinned, so the next thing to see is a
          scroll distance and not an element with an id on it. */}
      <ScrollHint
        onClick={() => goNext.current()}
        className="proc-hint absolute bottom-6 left-1/2 hidden in-[.arc]:max-md:inline-flex"
      />
    </section>
  );
}
