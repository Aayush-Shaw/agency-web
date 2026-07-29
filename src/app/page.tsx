import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Services from "@/components/Services";
import Work from "@/components/Work";
import WhyUs from "@/components/WhyUs";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Reviews from "@/components/Reviews";
import Trust from "@/components/Trust";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

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

            .atmosphere has to live inside for the same reason — a body-level
            backdrop would be behind this sheet and never seen again. z-10 +
            relative makes this a stacking context, so a z-index:-1 child
            paints above the sheet's own background and below every section,
            which is exactly where it sat on the body.

            overflow-x-clip pays for that move. .atmosphere is scrubbed from
            scale 1 to 1.3, and as a sticky (in-flow) element it now counts
            toward the document's scrollable width the way a fixed one never
            did — so the page grew a horizontal scrollbar that widened as you
            scrolled. clip, not hidden: hidden would make this a scroll
            container and kill the sticky positioning it exists to support.
            Work's mobile carousel keeps its own overflow-x-auto regardless. */}
        <div className="relative z-10 overflow-x-clip bg-bg">
          <div className="atmosphere" aria-hidden="true" />

          <Manifesto />
          <Services />
          <Work />
          <WhyUs />
          <Process />
          <Pricing />
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
