import { Hero } from '@/components/home/Hero';
import { CuisineCategories } from '@/components/home/CuisineCategories';
import { PopularItems } from '@/components/home/PopularItems';
import { PromotionalSection, StorySection } from '@/components/home/Sections';
import { LocationsSection } from '@/components/home/LocationsSection';
import { CateringBanner } from '@/components/home/CateringBanner';
import { ReservationSection } from '@/components/home/ReservationSection';

export default function Home() {
  return <>
    <Hero />
    <CuisineCategories />
    <PopularItems />
    <PromotionalSection />
    <LocationsSection />
    <CateringBanner />
    <StorySection />
    <ReservationSection />
  </>;
}
