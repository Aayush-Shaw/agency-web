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
      </main>
      <Footer />
    </>
  );
}
