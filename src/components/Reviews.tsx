import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const REVIEWS = [
  {
    quote:
      "Digital Bear rebuilt our site and it paid for itself in a month. Sharp design, and they actually hit every deadline.",
    name: "Sarah Whitmore",
    company: "Northwind Coffee, US",
    avatar: "/avatars/a1.svg",
    rating: 5,
  },
  {
    quote:
      "The AI video work is a different level. We localized a campaign into four languages in under a week — unheard of for us.",
    name: "James Callahan",
    company: "Lumen Finance, UK",
    avatar: "/avatars/a2.svg",
    rating: 5,
  },
  {
    quote:
      "Working across timezones is usually painful. With them it felt like they were down the hall. Same-day replies, every time.",
    name: "Elena Fischer",
    company: "Halo Skincare, DE",
    avatar: "/avatars/a3.svg",
    rating: 5,
  },
  {
    quote:
      "Motion graphics that finally match our brand. The team took rough notes and turned them into something we're proud of.",
    name: "Marcus Bell",
    company: "Apex Motors, US",
    avatar: "/avatars/a4.svg",
    rating: 5,
  },
];

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${i < rating ? "text-accent-primary" : "text-border"}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.4 21l1.4-6.9L1.6 9.3l7-.8z" />
      </svg>
    ))}
  </div>
);

/** Section 9 — client reviews. */
export default function Reviews() {
  return (
    <section id="reviews" className="bg-surface px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Client reviews</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Trusted by brands that{" "}
            <span className="text-gradient">sweat the details</span>.
          </h2>
        </Reveal>

        <Reveal stagger variant="blur" className="mt-12 grid gap-4 sm:grid-cols-2">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className="lift flex flex-col rounded-2xl border border-border bg-bg p-6"
            >
              <Stars rating={review.rating} />
              <blockquote className="mt-4 flex-1 text-lg leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image
                  src={review.avatar}
                  alt=""
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold">{review.name}</div>
                  <div className="text-sm text-text-muted">{review.company}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
