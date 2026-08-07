"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import usePawRake from "@/components/ui/usePawRake";
import useScrollFocus from "@/components/ui/useScrollFocus";

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
    a: "Bank transfer and all major cards. We bill 50% upfront to book the work and 50% on delivery. Larger engagements split into milestones instead.",
  },
  {
    topic: "Working hours",
    q: "How do you handle communication?",
    a: "We work your hours across US, UK, and EU timezones. You get one dedicated point of contact, async updates as we go, and scheduled calls whenever you want a live review.",
  },
  {
    topic: "Ownership",
    q: "Who owns the final deliverables?",
    a: "You do. On final payment you receive full ownership plus the source files — designs, project files, and footage. No lock-in, no licensing games.",
  },
];

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
 * Magnetic.tsx). That half now lives in PawRake.tsx, which Reviews rakes with
 * too — the paw is the site's hover, not this section's.
 *
 * Open/closed is still the browser's. <details name="faq"> is a native
 * exclusive accordion — opening one closes the last without a line of state —
 * and .elastic (globals.css) gives the panel its height transition. So there is
 * no `openIndex` here, and a screen reader gets the real expanded state rather
 * than one we remembered to announce.
 */
export default function Faq() {
  const list = useRef<HTMLUListElement>(null);
  const paw = usePawRake();
  // Touch's stand-in for the paw: the row crossing the middle of the screen
  // wears the state the paw would give it under a cursor.
  useScrollFocus(list, ".faq-row");

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
          {
            opacity: 0,
            x: -48,
            rotate: -1.4,
            clipPath: "inset(0% 100% 0% 0%)",
          },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            transformOrigin: "0% 50%",
            duration: 1,
            stagger: 0.1,
            clearProps: "all",
          },
        );

        // The topic lands a beat behind its own row, overlapped so the two
        // still read as one arrival rather than two passes down the list.
        tl.fromTo(
          tags,
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, clearProps: "all" },
          "-=0.85",
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
              },
            );
          });
        };

        const panels = gsap.utils.toArray<HTMLDetailsElement>("details", el);
        for (const panel of panels) panel.addEventListener("toggle", onToggle);

        // useGSAP reverts the timeline; the listeners are ours to take back —
        // including when the user turns reduced motion on and this context is
        // torn down, which is the point of hanging them off matchMedia at all.
        return () => {
          for (const panel of panels)
            panel.removeEventListener("toggle", onToggle);
        };
      });
    },
    { scope: list },
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

        {/* This box is what the paw is measured against and clipped to, so it
            rakes the ledger and nothing beyond it. No padding tricks needed:
            the clip lives on the paw's own layer, not here, so a focused row's
            outline (2px ring at 3px offset, globals.css) is never cut. */}
        <div
          onPointerMove={paw.track}
          onPointerLeave={paw.stop}
          className="relative"
        >
          {paw.layers}

          {/* Above the paw's layer, so the rows paint over it rather than under.
              They are transparent, so it still shows through them — only the
              type stays clear of it. */}
          <ul ref={list} className="relative z-10">
            {FAQS.map((faq) => (
              <li
                key={faq.q}
                // Same glass as the review cards: a translucent pane over a
                // backdrop-blur, with the paw raking behind it rather than
                // inside it, so the blur lands on the paw. bg-surface/20 and
                // not the cards' bg-bg/20 — that pairing is inverted here. A
                // review card is a bg pane on a bg-surface section; these rows
                // sit on the page's bg sheet, so surface is the token that
                // reads as a pane against it. bg-bg/20 would be invisible.
                // data-[focus] is the touch twin of every hover: on a phone the
                // row crossing the middle of the screen wears what a cursor
                // would give it. useScrollFocus sets the attribute.
                className="faq-row group relative border-t border-border px-2 backdrop-blur-xs last:border-b hover:bg-surface/20 data-focus:bg-surface/20"
              >
                {/* The rule lights up rather than a background flooding in: the
                    glow above already washes the row, and two lights on one
                    hover is one accessory too many. -top-px so it sits on the
                    hairline it replaces instead of beside it. */}
                <span
                  aria-hidden="true"
                  className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 brand-gradient transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-x-100 group-focus-within:scale-x-100 group-data-focus:scale-x-100 group-has-[[open]]:scale-x-100"
                />

                {/* The paw's light, parked. Its own clip box rather than
                    overflow-hidden on the row: the glow is 320px across on a
                    ~100px row, and clipping the row itself would take a focused
                    summary's outline with it. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                  <span className="focus-glow" />
                </span>

                <details name="faq" className="elastic">
                  <summary className="flex cursor-pointer list-none items-center gap-5 py-6 md:py-7 [&::-webkit-details-marker]:hidden">
                    {/* Shifts out of the paw's way on hover — the row gives
                        ground rather than lighting up in place. */}
                    <span className="min-w-0 flex-1 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-x-2 group-data-focus:translate-x-2">
                      <span className="faq-tag block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted transition-colors duration-300 group-hover:text-accent-primary group-data-focus:text-accent-primary group-has-[[open]]:text-accent-primary">
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
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border transition-colors duration-500 group-hover:border-accent-primary/60 group-data-focus:border-accent-primary/60 group-has-[[open]]:border-accent-primary">
                      <span
                        aria-hidden="true"
                        className="claw text-lg opacity-40 transition-[opacity,rotate] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:opacity-100 group-data-focus:opacity-100 group-has-[[open]]:rotate-180 group-has-[[open]]:opacity-100"
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
