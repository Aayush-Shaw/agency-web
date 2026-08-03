import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const FAQS = [
  {
    q: "How fast is your turnaround?",
    a: "It depends on scope, but first drafts usually land in a few days. Most projects wrap in two to four weeks, and we agree on the timeline before we start so there are no surprises.",
  },
  {
    q: "What's your revisions policy?",
    a: "Every project includes revision rounds — two on Basic, four on Medium, and unlimited on Pro. We iterate until the work is right rather than nickel-and-diming each change.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Bank transfer, all major cards, PayPal, and Wise. We typically bill 50% upfront to book the work and 50% on delivery. Larger engagements can be split into milestones.",
  },
  {
    q: "How do you handle timezones and communication?",
    a: "We work your hours across US, UK, and EU timezones. You get one dedicated point of contact, async updates as we go, and scheduled calls whenever you want a live review.",
  },
  {
    q: "Who owns the final deliverables?",
    a: "You do. On final payment you receive full ownership plus the source files — designs, project files, and footage. No lock-in, no licensing games.",
  },
];

/** Section 11 — FAQ accordion (native details, fully accessible). */
export default function Faq() {
  return (
    <section id="faq" className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal variant="words">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-5 text-section font-bold tracking-tight">
            Questions, <span className="text-gradient">answered</span>.
          </h2>
        </Reveal>

        <Reveal stagger className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-border bg-surface px-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-5 w-5 shrink-0 text-accent-primary transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="pb-5 leading-relaxed text-text-muted">{faq.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
