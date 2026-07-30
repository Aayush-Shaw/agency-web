import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

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

const REASONS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "AI-powered video production",
    body: "We pair a real creative team with AI tooling to produce polished video at a scale and speed traditional studios can't match.",
    icon: icon(
      <>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="m17 10 4-2v8l-4-2" />
        <path d="m8 3 .5 1.5L10 5l-1.5.5L8 7l-.5-1.5L6 5l1.5-.5z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    title: "Fast turnaround",
    body: "Tight, predictable timelines. First drafts in days, not weeks — without cutting corners on quality.",
    icon: icon(
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" />
      </>
    ),
  },
  {
    title: "Western-timezone communication",
    body: "We work on your hours. Overlapping US, UK, and EU schedules mean quick replies and same-day feedback loops.",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
  },
  {
    title: "Dedicated support",
    body: "One point of contact who knows your brand, from kickoff through launch and beyond. No ticket queues.",
    icon: icon(
      <>
        <path d="M4 18v-6a8 8 0 0 1 16 0v6" />
        <path d="M4 15a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 15a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" />
      </>
    ),
  },
];

/** Section 6 — why choose us. */
export default function WhyUs() {
  return (
    <section id="why" className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="words">
          <Eyebrow>Why Digital Bear</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Built to feel like your{" "}
            <span className="text-gradient">in-house team</span>.
          </h2>
        </Reveal>

        <Reveal stagger variant="slide" className="mt-12 grid gap-4 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="lift rounded-2xl border border-border bg-surface p-6"
            >
              <span className="text-accent-primary">{reason.icon}</span>
              <h3 className="mt-4 text-card font-semibold tracking-tight">
                {reason.title}
              </h3>
              <p className="mt-2 leading-relaxed text-text-muted">
                {reason.body}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
