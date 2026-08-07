import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import WhyUs from "@/components/sections/WhyUs";
import Process from "@/components/sections/Process";
// Pricing is parked, not deleted — uncomment this and the <Pricing /> below,
// plus the "Pricing" entries in Navbar.tsx and Footer.tsx, to bring it back.
// import Pricing from "@/components/sections/Pricing";
import Reviews from "@/components/sections/Reviews";
import Trust from "@/components/sections/Trust";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";
import Footer from "@/components/sections/Footer";
import MeshGradient from "@/components/ui/MeshGradient";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Everything after the hero rides up over it as one opaque sheet.
            bg-bg is load-bearing, not decoration: the hero stays pinned
            underneath, and six of these sections are deliberately transparent,
            so without a background here any section shorter than the viewport
            (Manifesto is 522px on a 844px phone) shows the hero through the
            strip below it.

            The mesh field has to live inside for the same reason — a
            body-level backdrop would be behind this sheet and never seen
            again. z-10 + relative makes this a stacking context, so a
            z-index:-1 child paints above the sheet's own background and below
            every section, which is where a backdrop belongs.

            overflow-clip pays for that: the field is sticky, and a sticky
            (in-flow) element counts toward the document's scrollable area the
            way a fixed one never did.
            clip, not hidden: hidden would make this a scroll container and
            kill the sticky positioning it exists to support (and Process's
            pin, which is position:fixed, escapes clip either way).
            Work's mobile carousel keeps its own overflow-x-auto regardless. */}
        <div className="relative z-10 overflow-clip bg-bg">
          {/* The animated field. This is the only place a backdrop can cover
              the whole post-hero sheet without reaching the pinned hero. */}
          <MeshGradient />

          <Manifesto />
          <Services />
          <Work />
          {/* WhyUs sticks and Process rides up over it, so the two are wrapped
              together: sticky is bounded by its containing block, and without
              this wrapper WhyUs would stay pinned for the whole rest of the
              page — visible straight through Reviews, Trust, Faq and Cta,
              which are all deliberately transparent. */}
          <div className="relative">
            <WhyUs />
            <Process />
          </div>
          {/* <Pricing /> */}
          <Reviews />
          <Trust />
          <Faq />
          <Cta />
        </div>
      </main>
      <Footer />
    </>
  );
}
