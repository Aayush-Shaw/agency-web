import Reveal from "@/components/Reveal";

/** Section 3 — a single bold statement that animates in on scroll. */
export default function Manifesto() {
  return (
    <section className="bg-surface px-5 py-24 md:px-8 md:py-36">
      <Reveal
        as="p"
        className="mx-auto max-w-4xl text-center text-3xl font-semibold leading-snug tracking-tight sm:text-4xl md:text-5xl"
      >
        Most studios ship templates. We build brands that{" "}
        <span className="text-gradient">move</span> — every pixel, frame, and
        line of copy considered, so the work feels as sharp as the product
        behind it.
      </Reveal>
    </section>
  );
}
