/**
 * What the project configurator asks - services, their one follow-up question,
 * and the timeline question. Content only: no prices, no UI.
 *
 * The five services mirror `SERVICES` in components/sections/Services.tsx.
 * They're spelled out again rather than imported because that array carries
 * JSX icons and lives inside a section component - copying five strings beats
 * making a config file depend on a rendered section.
 *
 * Adding a service: add an entry here, then its rates in ./estimatePricing.ts.
 * TypeScript will fail the build until you do - see RateKey over there.
 */

export const SERVICES = [
  {
    id: "web",
    label: "Website Development",
    question: "How big is the build?",
    options: [
      { value: "landing", label: "Landing page - one page, one goal" },
      { value: "standard", label: "Standard site - 5 to 8 sections" },
      { value: "custom", label: "Full custom build - CMS, integrations, the works" },
    ],
  },
  {
    id: "ai",
    label: "AI Avatars Content",
    question: "How many AI videos?",
    options: [
      { value: "pilot", label: "Pilot - 1 to 3 videos, one avatar" },
      { value: "series", label: "Series - 4 to 8 videos or ad variations" },
      { value: "scale", label: "At scale - 10+ videos, multi-language" },
    ],
  },
  {
    id: "design",
    label: "Graphic Design & Branding",
    question: "What needs designing?",
    options: [
      { value: "identity", label: "Brand identity - logo, colors, type, guidelines" },
      { value: "creatives", label: "Creative batch - posters, ads, social posts" },
      { value: "system", label: "Full brand system - identity plus a creative library" },
    ],
  },
  {
    id: "social",
    label: "Social Media Management",
    question: "How much content per month?",
    options: [
      { value: "light", label: "Light - 8 to 12 posts a month" },
      { value: "growth", label: "Growth - 16 to 20 posts, reels included" },
      { value: "always-on", label: "Always-on - daily posting plus community management" },
    ],
  },
  {
    id: "ads",
    label: "Digital Marketing & Ads",
    question: "How much do you want to run?",
    options: [
      { value: "single", label: "One campaign - a single channel, one goal" },
      { value: "multi", label: "Multi-channel - Meta, Google, and beyond" },
      { value: "managed", label: "Fully managed - strategy, creative, monthly tuning" },
    ],
  },
] as const;

export const TIMELINES = [
  { value: "asap", label: "ASAP - we're on a deadline" },
  { value: "standard", label: "Standard - the pace the work wants" },
  { value: "flexible", label: "Flexible - no hard deadline" },
] as const;

export type Service = (typeof SERVICES)[number];
export type ServiceId = Service["id"];
export type TimelineId = (typeof TIMELINES)[number]["value"];

/** Which option the visitor picked for each service they selected. */
export type Answers = Partial<Record<ServiceId, string>>;

/** Non-null because ServiceId can only ever name a service in the array. */
export const serviceById = (id: ServiceId): Service =>
  SERVICES.find((s) => s.id === id)!;

export const optionLabel = (id: ServiceId, value: string | undefined): string =>
  serviceById(id).options.find((o) => o.value === value)?.label ?? "-";

export const timelineLabel = (value: TimelineId): string =>
  TIMELINES.find((t) => t.value === value)!.label;
