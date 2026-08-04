"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

/* `topic` is the structural device here, and it is not decoration: an FAQ is
   not a sequence, so numbering it (01 / 02 / 03) would encode an order that
   does not exist. What a reader actually does with this list is scan it for
   the one thing they came to check — so every row is filed under the thing it
   answers, and the topic is the first line of the row. */
const FAQS = [
  {
    topic: "Timeline",
    q: "How fast is your turnaround?",
    a: "It depends on scope, but first drafts usually land in a few days. Most projects wrap in two to four weeks, and we agree on the timeline before we start so there are no surprises.",
  },
  {
    topic: "Revisions",
    q: "What's your revisions policy?",
    // No tier names in here. Pricing is parked (see page.tsx), so naming Basic
    // / Medium / Pro would point at a section that no longer renders.
    a: "Every project includes revision rounds, and the count is agreed in your scope before anything starts. We iterate until the work is right rather than nickel-and-diming each change.",
  },
  {
    topic: "Payment",
    q: "How do you handle payment?",
    a: "Bank transfer, all major cards, PayPal, and Wise. We bill 50% upfront to book the work and 50% on delivery. Larger engagements split into milestones instead.",
  },
  {
    topic: "Working hours",
    q: "How do you handle timezones and communication?",
    a: "We work your hours across US, UK, and EU timezones. You get one dedicated point of contact, async updates as we go, and scheduled calls whenever you want a live review.",
  },
  {
    topic: "Ownership",
    q: "Who owns the final deliverables?",
    a: "You do. On final payment you receive full ownership plus the source files — designs, project files, and footage. No lock-in, no licensing games.",
  },
];

/* The paw is heavy and lags behind the cursor; the light under it keeps up.
   That difference is the whole effect — matched springs would read as one
   cursor decoration, and the drag is what makes it feel like an animal's paw
   being pulled across the list rather than a shape parented to the pointer. */
const PAW = { stiffness: 110, damping: 17, mass: 1.1 };
const GLOW = { stiffness: 260, damping: 30, mass: 0.6 };
/* Softens the tilt, which is derived from velocity and so is noisy at source. */
const TILT = { stiffness: 190, damping: 26 };

/** The site's standard curve — see .lift in globals.css. */
const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

/**
 * Section 11 — FAQ, as a raked ledger.
 *
 * The pitch sticks in the left column while five hairline-ruled rows scroll
 * past it, and a bear's paw rakes across those rows under the cursor: the
 * signature claw from every eyebrow on the site, scaled up and handed the
 * pointer. It trails on a loose spring and tilts into the direction it is being
 * dragged, so a fast swipe down the list drags it sideways and a stop lets it
 * settle back level.
 *
 * Motion is split the way the rest of the site splits it. GSAP owns scroll:
 * the rows are scratched in left-to-right on a clip-path wipe as the list
 * arrives, and each answer's lines rise in sequence when it opens. Framer owns
 * the pointer: the paw, its light, and the tilt are springs retargeted on every
 * mousemove, which GSAP would need a tween per frame to do (same reasoning as
 * Magnetic.tsx).
 *
 * Open/closed is still the browser's. <details name="faq"> is a native
 * exclusive accordion — opening one closes the last without a line of state —
 * and .elastic (globals.css) gives the panel its height transition. So there is
 * no `openIndex` here, and a screen reader gets the real expanded state rather
 * than one we remembered to announce.
 */
export default function Faq() {
  const list = useRef<HTMLDivElement>(null);
  const [raking, setRaking] = useState(false);
  const reduced = useReducedMotion();

  // Pointer position inside the list, in px from its top-left corner.
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
    TILT
  );

  useGSAP(
    () => {
      const el = list.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".faq-row", el);
        const tags = gsap.utils.toArray<HTMLElement>(".faq-tag", el);

        // The ledger is scratched in rather than faded in: each row wipes open
        // from its left edge while sliding the last of the way into its rule,
        // pivoted about that same edge so the far end swings down into place.
        // clearProps is load-bearing, not tidiness — an inline clip-path left
        // behind would still be cropping the row when its answer opened, and an
        // inline transform outranks the hover translate on the question.
        //
        // No `once: true`. Reveal.tsx has the long version of why: it kills the
        // trigger mid-refresh and takes the page down when the browser lands on
        // a deep anchor. The default toggleActions already play exactly once.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 80%" },
        });

        tl.fromTo(
          rows,
          { opacity: 0, x: -48, rotate: -1.4, clipPath: "inset(0% 100% 0% 0%)" },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            transformOrigin: "0% 50%",
            duration: 1,
            stagger: 0.1,
            clearProps: "all",
          }
        );

        // The topic lands a beat behind its own row, overlapped so the two
        // still read as one arrival rather than two passes down the list.
        tl.fromTo(
          tags,
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, clearProps: "all" },
          "-=0.85"
        );

        /* An answer's lines rise in sequence as its panel opens, so the two
           halves of the disclosure — the height and the text — arrive together
           instead of a finished paragraph being revealed by a growing box.

           Split on open and reverted on arrival rather than once at setup: a
           line split is measured against the width it was made at, so a
           long-lived one is wrong after the first resize. Splitting per open
           costs a few ms and is always measured against the layout in front of
           the reader.

           rAF because a closed <details> panel carries content-visibility:
           hidden, which skips its layout — measured in the same tick as the
           toggle, SplitText would be reading a box the browser has not laid out
           yet and would hand back one line for the whole paragraph. */
        const onToggle = (event: Event) => {
          const details = event.currentTarget as HTMLDetailsElement;
          if (!details.open) return;
          const copy = details.querySelector<HTMLElement>(".faq-a p");
          if (!copy) return;

          requestAnimationFrame(() => {
            const split = new SplitText(copy, { type: "lines" });
            gsap.fromTo(
              split.lines,
              { opacity: 0, y: 16, filter: "blur(8px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.6,
                stagger: 0.07,
                ease: "power3.out",
                // The split leaves line <div>s React did not render; putting the
                // original markup back the moment the tween lands keeps them out
                // of the tree React reconciles against.
                onComplete: () => split.revert(),
              }
            );
          });
        };

        const panels = gsap.utils.toArray<HTMLDetailsElement>("details", el);
        for (const panel of panels) panel.addEventListener("toggle", onToggle);

        // useGSAP reverts the timeline; the listeners are ours to take back —
        // including when the user turns reduced motion on and this context is
        // torn down, which is the point of hanging them off matchMedia at all.
        return () => {
          for (const panel of panels) panel.removeEventListener("toggle", onToggle);
        };
      });
    },
    { scope: list }
  );

  return (
    <section id="faq" className="px-5 py-24 md:px-8 md:py-32">
      {/* Asymmetric on purpose. Every other section on this page stacks its
          heading over its content, and three of the four around this one are
          card grids — so the pitch moving into a column of its own and holding
          still is the change of rhythm that stops the run of them.
          items-start is what lets the rail stick: a stretched grid item is
          already as tall as the row, and a sticky box with nowhere to travel
          never moves. */}
      <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-16">
        {/* top-28 is the fixed navbar's 5rem plus air. */}
        <Reveal variant="words" className="lg:sticky lg:top-28">
          <Eyebrow>Before you ask</Eyebrow>
          <h2 className="mt-5 text-section font-bold tracking-tight">
            No mysteries, no <span className="text-gradient">fine print</span>.
          </h2>
          <p className="mt-5 max-w-sm text-lead text-text-muted">
            The questions that come up on every first call — answered here
            before you have to ask them.
          </p>
        </Reveal>

        {/* The paw is drawn from the cursor's position and so can reach half its
            own width past the rows at the edges; the clip keeps it inside the
            ledger. -mx-2/px-2 buys back the 8px it would otherwise cut off a
            focused row's outline (2px ring at 3px offset, globals.css). */}
        <div
          ref={list}
          onPointerMove={(event) => {
            // Fine pointers only, for the reason Magnetic.tsx gives: on touch
            // this would put a paw under the finger that is trying to press.
            if (reduced || event.pointerType !== "mouse" || !list.current) return;
            const box = list.current.getBoundingClientRect();
            const nx = event.clientX - box.left;
            const ny = event.clientY - box.top;
            // First frame of a hover: jump rather than spring, or the paw
            // streaks in from the list's top-left corner every time the cursor
            // enters — a swipe nobody made.
            if (!raking) {
              pawX.jump(nx);
              pawY.jump(ny);
              glowX.jump(nx);
              glowY.jump(ny);
              setRaking(true);
            }
            x.set(nx);
            y.set(ny);
          }}
          onPointerLeave={() => setRaking(false)}
          className="relative -mx-2 overflow-hidden px-2"
        >
          {!reduced && (
            <>
              {/* Warm light under the paw, which is what actually picks the row
                  out — the claw itself is a mark, not a lamp. */}
              <motion.span
                aria-hidden="true"
                style={{ x: glowX, y: glowY }}
                animate={{ opacity: raking ? 1 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="pointer-events-none absolute left-0 top-0 -ml-40 -mt-40 size-80 rounded-full bg-accent-primary/20 blur-3xl"
              />
              {/* .claw sizes itself at 1em and is unlayered, so it outranks any
                  size-* utility (same cascade note as :focus-visible in
                  globals.css) — font-size is the handle on how big it gets. */}
              <motion.span
                aria-hidden="true"
                style={{ x: pawX, y: pawY, rotate: tilt }}
                animate={{ opacity: raking ? 0.45 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="claw pointer-events-none absolute left-0 top-0 -ml-14 -mt-14 text-[7rem]"
              />
            </>
          )}

          {/* relative, so the rows paint over the paw rather than under it:
              among positioned siblings at z-index auto the later one wins, and
              an unpositioned <ul> would lose to both absolute spans above. */}
          <ul className="relative">
            {FAQS.map((faq) => (
              <li
                key={faq.q}
                className="faq-row group relative border-t border-border last:border-b"
              >
                {/* The rule lights up rather than a background flooding in: the
                    glow above already washes the row, and two lights on one
                    hover is one accessory too many. -top-px so it sits on the
                    hairline it replaces instead of beside it. */}
                <span
                  aria-hidden="true"
                  className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-accent-primary to-accent-secondary transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-x-100 group-focus-within:scale-x-100 group-has-[[open]]:scale-x-100"
                />

                <details name="faq" className="elastic">
                  <summary className="flex cursor-pointer list-none items-center gap-5 py-6 md:py-7 [&::-webkit-details-marker]:hidden">
                    {/* Shifts out of the paw's way on hover — the row gives
                        ground rather than lighting up in place. */}
                    <span className="min-w-0 flex-1 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-x-2">
                      <span className="faq-tag block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted transition-colors duration-300 group-hover:text-accent-primary group-has-[[open]]:text-accent-primary">
                        {faq.topic}
                      </span>
                      <span className="faq-q mt-2 block font-display text-card-lg font-semibold tracking-tight">
                        {faq.q}
                      </span>
                    </span>

                    {/* The claw is the state indicator: dim and pointing up when
                        closed, full-gradient and turned over when open. The
                        panel and the rule say the same thing at the same time,
                        and <summary> tells assistive tech outright, so this can
                        be the brand's mark rather than a chevron. */}
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border transition-colors duration-500 group-hover:border-accent-primary/60 group-has-[[open]]:border-accent-primary">
                      <span
                        aria-hidden="true"
                        className="claw text-lg opacity-40 transition-[opacity,rotate] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:opacity-100 group-has-[[open]]:rotate-180 group-has-[[open]]:opacity-100"
                      />
                    </span>
                  </summary>

                  {/* Padding lives in here, not on ::details-content, so the
                      elastic close collapses it with everything else. */}
                  <div className="faq-a pb-8 pr-16">
                    <p className="max-w-[52ch] leading-relaxed text-text-muted">
                      {faq.a}
                    </p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
