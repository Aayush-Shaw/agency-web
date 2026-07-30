import Eyebrow from "@/components/ui/Eyebrow";
import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Basic",
    price: "$1,500",
    cadence: "per project",
    tagline: "For a focused, high-quality launch.",
    features: [
      "One core service",
      "Up to 5 pages or 8 deliverables",
      "2 rounds of revisions",
      "2-week turnaround",
      "Email support",
    ],
  },
  {
    name: "Medium",
    price: "$3,500",
    cadence: "per project",
    tagline: "For growing brands that need more.",
    features: [
      "Up to two services combined",
      "Motion graphics & video included",
      "4 rounds of revisions",
      "Priority turnaround",
      "Dedicated project manager",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "$7,500",
    cadence: "per project",
    tagline: "For full-scale, end-to-end production.",
    features: [
      "Full-service production",
      "AI-generated video & avatars",
      "Unlimited revisions",
      "Fastest turnaround",
      "Dedicated team + shared Slack",
    ],
  },
];

const Check = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary"
    aria-hidden="true"
  >
    <path d="m5 12 5 5 9-11" />
  </svg>
);

/** Section 8 — pricing, middle tier featured. */
export default function Pricing() {
  return (
    <section id="pricing" className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="words">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Clear pricing, <span className="text-gradient">no surprises</span>.
          </h2>
          <p className="mt-4 max-w-xl text-text-muted">
            Fixed-scope project pricing in USD. Need something custom? We&apos;ll
            tailor a quote to your goals.
          </p>
        </Reveal>

        <Reveal
          stagger
          variant="scale"
          className="mt-12 grid items-start gap-4 lg:grid-cols-3"
        >
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`lift relative flex flex-col rounded-2xl border bg-surface p-7 ${
                tier.featured
                  ? "glow-ring border-transparent lg:-mt-4 lg:pb-11"
                  : "border-border"
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-linear-to-r from-accent-primary to-accent-secondary px-3 py-1 text-xs font-semibold text-bg">
                  Most Popular
                </span>
              )}

              <h3 className="text-card font-semibold tracking-tight">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{tier.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold">
                  {tier.price}
                </span>
                <span className="text-sm text-text-muted">{tier.cadence}</span>
              </div>

              <ul className="mt-6 flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Check />
                    <span className="text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Magnetic className="mt-8 w-full">
                <a
                  href="#contact"
                  className={`inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-transform hover:scale-[1.03] ${
                    tier.featured
                      ? "glow bg-linear-to-r from-accent-primary to-accent-secondary text-bg"
                      : "border border-border text-text hover:border-accent-primary"
                  }`}
                >
                  Get started
                </a>
              </Magnetic>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
