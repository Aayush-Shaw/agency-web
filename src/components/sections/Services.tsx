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
    // The Bézier pen tool, as it looks in Illustrator: nib tapering to a point
    // at top-left, the split down its middle, the anchor on the curve.
    // Geometry from lucide-react's `pen-tool` (ISC), inlined rather than
    // imported so it goes through icon() and carries the same 1.6 stroke as
    // its five siblings - a <PenTool /> would bring Lucide's own defaults.
    icon: icon(
      <>
        <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
        <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
        <path d="m2.3 2.3 7.286 7.286" />
        <circle cx="11" cy="11" r="2" />
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
    // A heart inside a speech bubble - likes and comments, which is what
    // "social media" looks like to anyone who has ever used it. The old
    // thumbs-up-with-a-tick read as a cloud at this size.
    // lucide-react `message-circle-heart` (ISC), inlined - see the pen tool above.
    icon: icon(
      <>
        <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
        <path d="M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 5.004 2.224 3 3 0 0 1-.832 2.083l-3.447 3.62a1 1 0 0 1-1.45-.001z" />
      </>
    ),
  },
  {
    heading: "Digital Marketing & Ads",
    description: "Campaigns that put you in front of buyers.",
    detail:
      "Targeted ad campaigns built around the people you actually want to reach, then tuned against real numbers - clicks, leads, and sales.",
    deliverables: ["Ad campaigns", "Audience targeting", "Landing pages", "Monthly reporting"],
    // A megaphone - the universal mark for advertising. The horn, the handle
    // hanging off its underside, and the seam across the mouth; the handle is
    // what stops it reading as a plain cone.
    // lucide-react `megaphone` (ISC), inlined - see the pen tool above.
    icon: icon(
      <>
        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
        <path d="M8 6v8" />
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
