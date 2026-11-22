import FeaturedServices from "@/components/sections/homepage/FeaturedServices";
import Hero from "@/components/sections/homepage/Hero";
import HowItWorks from "@/components/sections/homepage/HowItWorks";
import ServiceCategories from "@/components/sections/homepage/ServiceCategories";

export default function Home() {
  return (
    <div>
      <Hero/>
      <FeaturedServices />
      <ServiceCategories />
      <HowItWorks />
    </div>
  );
}
