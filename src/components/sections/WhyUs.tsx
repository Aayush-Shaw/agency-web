import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import CardRail, { type RailItem } from "@/components/ui/CardRail";

const icon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    {path}
  </svg>
);

/* No `detail` or `deliverables` on any of these, which is the whole difference
   between this rail and the Services one: four short cards instead of five tall
   ones. CardRail measures its own height from the cards, so that needs no
   tuning here. */
const REASONS: RailItem[] = [
  {
    heading: "AI-powered video production",
    description:
      "We pair a real creative team with AI tooling to produce polished video at a scale and speed traditional studios can't match.",
    icon: icon(
      <>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="m17 10 4-2v8l-4-2" />
        <path d="m8 3 .5 1.5L10 5l-1.5.5L8 7l-.5-1.5L6 5l1.5-.5z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    heading: "Fast turnaround",
    description:
      "Tight, predictable timelines. First drafts in days, not weeks - without cutting corners on quality.",
    icon: icon(
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" />
      </>
    ),
  },
  {
    heading: "Western-timezone communication",
    description:
      "We work on your hours. Overlapping US, UK, and EU schedules mean quick replies and same-day feedback loops.",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
  },
  {
    heading: "Dedicated support",
    description:
      "One point of contact who knows your brand, from kickoff through launch and beyond. No ticket queues.",
    icon: icon(
      <>
        <path d="M4 18v-6a8 8 0 0 1 16 0v6" />
        <path d="M4 15a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 15a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" />
      </>
    ),
  },
];

/**
 * Section 6 - why choose us, on the same curved rail as Services.
 *
 * Sticky at lg, so Process rides up over it rather than pushing it along. z-0
 * keeps it under Process's z-20, and the pair is wrapped in page.tsx to bound
 * how long it sticks.
 *
 * h-svh is what makes that safe, and it is not decoration. A sticky element
 * held at top:0 never scrolls again, so anything of it below the fold when it
 * lands is unreachable. Pinning the section to exactly one viewport and
 * centring what's inside means the whole of it is on screen at the moment it
 * pins. (bottom-0 is not the alternative it looks like: it pins a box *before*
 * you reach it, not after.)
 *
 * flex-col + justify-center, not items-center: there are two children here (the
 * heading and the rail), and on the cross axis alone they would sit side by
 * side. pt-20 rather than symmetric padding because the centring has to clear
 * the fixed navbar, which this scrolls under. And `not-short` because below
 * 44rem of viewport height the heading, the rail and the navbar no longer fit
 * together - there the section keeps its normal flow, and Process's negative
 * margin still carries it over the top.
 */
export default function WhyUs() {
  return (
    <section
      id="why"
      className="px-5 py-24 md:px-8 md:py-32 lg:not-short:sticky lg:not-short:top-0 lg:not-short:z-0 lg:not-short:flex lg:not-short:h-svh lg:not-short:flex-col lg:not-short:justify-center lg:not-short:pt-20 lg:not-short:pb-0"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <Reveal variant="words">
          <Eyebrow>Why Digi Bear</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Built to feel like your{" "}
            <span className="text-gradient">in-house team</span>.
          </h2>
        </Reveal>
      </div>

      <CardRail items={REASONS} label="Reasons to choose Digi Bear." />
    </section>
  );
}
