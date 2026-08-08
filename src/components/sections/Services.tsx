import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import CardRail, { type RailItem } from "@/components/ui/CardRail";

// 24×24 stroke icons (currentColor) - no icon dependency.
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

const SERVICES: RailItem[] = [
  {
    heading: "Website Development",
    description: "Fast, easy-to-use sites that turn visitors into customers.",
    detail:
      "Designed and built in one place, so nothing gets lost in handoff. Loads quickly, looks right on every screen, and is built to be found on Google.",
    deliverables: ["UX & UI design", "Next.js build", "Mobile responsive", "SEO & speed"],
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="15" rx="2" />
        <path d="M3 8h18" />
        <path d="m9 12 2 2-2 2M15 12l-2 2 2 2" />
      </>
    ),
  },
  {
    heading: "Graphic Design & Branding",
    description: "Visuals that make your brand impossible to forget.",
    detail:
      "Posters, ad creatives, and Instagram posts drawn from one consistent look - so everything you put out is instantly recognizable as yours.",
    deliverables: ["Brand identity", "Ad creatives", "Social posts", "Posters & print"],
    icon: icon(
      <>
        <path d="M12 19 4 21l2-8 9-9a2.8 2.8 0 0 1 4 4z" />
        <path d="m14 5 4 4" />
      </>
    ),
  },
  {
    heading: "Video Editing",
    description: "Reels and promos cut to hold attention.",
    detail:
      "Short-form and long-form edits with sharp pacing, color, and sound - captioned and exported in the right format for every platform.",
    deliverables: ["Reels & shorts", "Promos", "Color & sound", "Captions & delivery"],
    icon: icon(
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h4m10 0h4M3 15h4m10 0h4M8 5v14m8-14v14" />
      </>
    ),
  },
  {
    heading: "Cutting-Edge AI Solutions",
    description: "AI avatars and video, without a film crew.",
    detail:
      "Custom AI presenters and generated video that let you ship ads, explainers, and language versions in days instead of weeks.",
    deliverables: ["Custom AI avatars", "Script to video", "Multi-language", "Ad variations"],
    icon: icon(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path
          d="m19 3 .7 1.8L21.5 5.5l-1.8.7L19 8l-.7-1.8L16.5 5.5l1.8-.7z"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
  },
  {
    heading: "Social Media Management",
    description: "We run your handles so you don't have to.",
    detail:
      "Planning, scheduling, posting, and replying to your community - handled end to end while the follower count climbs.",
    deliverables: ["Content calendar", "Scheduling & posting", "Community replies", "Growth reporting"],
    icon: icon(
      <>
        <path d="M4 15a4 4 0 0 1 4-4h1V6a3 3 0 0 1 6 0v5h1a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4Z" />
        <path d="m9 13 2 2 4-4" />
      </>
    ),
  },
  {
    heading: "Digital Marketing & Ads",
    description: "Campaigns that put you in front of buyers.",
    detail:
      "Targeted ad campaigns built around the people you actually want to reach, then tuned against real numbers - clicks, leads, and sales.",
    deliverables: ["Ad campaigns", "Audience targeting", "Landing pages", "Monthly reporting"],
    icon: icon(
      <>
        <path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1Z" />
        <path d="M18 9.5a4 4 0 0 1 0 5" />
      </>
    ),
  },
];

/** Section 4 - services, on the shared curved rail (see ui/CardRail.tsx). */
export default function Services() {
  return (
    <section id="services" className="px-2 pt-24 md:px-8 md:pt-30 pb-10">
      <div className="mx-auto max-w-[1600px]">
        <Reveal variant="words">
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-2 max-w-3xl text-section font-bold tracking-tight">
            Six services, one <span className="text-gradient">creative team</span>.
          </h2>
        </Reveal>
      </div>

      <CardRail items={SERVICES} label="Services." />
    </section>
  );
}
