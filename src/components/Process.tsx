import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "We dig into your goals, audience, and market, then agree on scope, timeline, and what success looks like.",
  },
  {
    n: "02",
    title: "Design",
    body: "Concepts, direction, and prototypes. You see and shape the work early — no big reveals, no surprises.",
  },
  {
    n: "03",
    title: "Build",
    body: "We produce the final assets — site, content, motion, or video — with regular check-ins and fast revisions.",
  },
  {
    n: "04",
    title: "Launch",
    body: "We ship, QA, and hand over clean files. Then we stay on to measure, iterate, and help you grow.",
  },
];

/** Section 7 — how we work (real sequence, so numbering is meaningful). */
export default function Process() {
  return (
    <section id="process" className="bg-surface px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>How we work</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            A simple path from{" "}
            <span className="text-gradient">idea to launch</span>.
          </h2>
        </Reveal>

        <Reveal
          as="ol"
          stagger
          className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-border pt-5">
              <span className="font-display text-4xl font-bold text-gradient">
                {step.n}
              </span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-text-muted">{step.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
