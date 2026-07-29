import type { ReactNode } from "react";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

type Service = {
  title: string;
  summary: string;
  detail: string;
  deliverables: string[];
  icon: ReactNode;
};

// 24×24 stroke icons (currentColor) — no icon dependency.
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

const SERVICES: Service[] = [
  {
    title: "Website Design & Development",
    summary: "Fast, conversion-focused sites built to sell.",
    detail:
      "Design and build in one place — no handoff gaps. Accessible, SEO-ready, and fast on every device.",
    deliverables: ["UX & UI design", "Next.js build", "CMS & analytics", "Core Web Vitals"],
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="15" rx="2" />
        <path d="M3 8h18" />
        <path d="m9 12 2 2-2 2M15 12l-2 2 2 2" />
      </>
    ),
  },
  {
    title: "Social Media Marketing",
    summary: "Content and campaigns that grow real audiences.",
    detail:
      "Strategy, content calendars, and paid campaigns tuned to your market — measured by reach, engagement, and pipeline.",
    deliverables: ["Content strategy", "Post design", "Paid campaigns", "Monthly reporting"],
    icon: icon(
      <>
        <path d="M4 15a4 4 0 0 1 4-4h1V6a3 3 0 0 1 6 0v5h1a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4Z" />
        <path d="m9 13 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Motion Graphics",
    summary: "Animated brand systems that stop the scroll.",
    detail:
      "Logo animations, explainers, and social motion built from a consistent kit so your brand moves the same everywhere.",
    deliverables: ["Logo animation", "Explainers", "Social motion", "Lower-thirds kit"],
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    title: "Video Editing",
    summary: "Story-first edits, color, and sound that land.",
    detail:
      "Short-form and long-form editing with color grading, sound design, captions, and delivery specs for every platform.",
    deliverables: ["Short & long form", "Color grade", "Sound design", "Captions & delivery"],
    icon: icon(
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h4m10 0h4M3 15h4m10 0h4M8 5v14m8-14v14" />
      </>
    ),
  },
  {
    title: "AI-Generated Avatars & Video",
    summary: "Scale video production without a film crew.",
    detail:
      "Lifelike AI presenters and generated scenes for ads, explainers, and localization — produced in days, not weeks.",
    deliverables: ["AI presenters", "Script to video", "Localization", "Ad variations"],
    icon: icon(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path d="m19 3 .7 1.8L21.5 5.5l-1.8.7L19 8l-.7-1.8L16.5 5.5l1.8-.7z" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

/** Section 4 — services. Each card taps open to reveal deliverables. */
export default function Services() {
  return (
    <section id="services" className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Five services, one <span className="text-gradient">creative team</span>.
          </h2>
        </Reveal>

        <Reveal
          stagger
          variant="scale"
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service, i) => (
            <details
              key={service.title}
              className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/60 hover:shadow-[0_14px_44px_-14px_var(--raw-glow)]"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between">
                  {/* Accent alternates honey/cinnamon down the list. Rockstar
                      rotates its CTA pill colour card-to-card for the same
                      reason: it stops a stack of cards reading as a template. */}
                  <span
                    className={
                      i % 2 === 0 ? "text-accent-primary" : "text-accent-secondary"
                    }
                  >
                    {service.icon}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="h-5 w-5 text-text-muted transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-card font-semibold tracking-tight">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-text-muted">{service.summary}</p>
                </div>
              </summary>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm leading-relaxed text-text-muted">
                  {service.detail}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {service.deliverables.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
