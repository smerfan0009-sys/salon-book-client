import FeaturedServices from "@/components/sections/homepage/FeaturedServices";
import Hero from "@/components/sections/homepage/Hero";
import ServiceCategories from "@/components/sections/homepage/ServiceCategories";

export default function Home() {
  return (
    <div>
      <Hero/>
      <FeaturedServices />
      <ServiceCategories />
    </div>
  );
}
