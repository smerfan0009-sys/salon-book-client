import FAQ from "@/components/sections/homepage/FAQ";
import FeaturedServices from "@/components/sections/homepage/FeaturedServices";
import FinalCTA from "@/components/sections/homepage/FinalCTA";
import Hero from "@/components/sections/homepage/Hero";
import HowItWorks from "@/components/sections/homepage/HowItWorks";
import ServiceCategories from "@/components/sections/homepage/ServiceCategories";
import Testimonials from "@/components/sections/homepage/Testimonials";
import WhyChooseUs from "@/components/sections/homepage/WhyChooseUs";

export default function Home() {
  return (
    <div>
      <Hero/>
      <FeaturedServices />
      <ServiceCategories />
      <HowItWorks />
       <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
