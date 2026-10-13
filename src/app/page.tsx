import { Hero } from '@/components/home/Hero';
import { CuisineCategories } from '@/components/home/CuisineCategories';
import { PopularItems } from '@/components/home/PopularItems';
import { StorySection } from '@/components/home/Sections';
import { CateringPreview, LocationsPreview, OrderPreview, ReservationPreview } from '@/components/home/Previews';

export default function Home() {
  return <div className="home-page">
    <Hero />
    <CuisineCategories />
    <PopularItems />
    <OrderPreview />
    <LocationsPreview />
    <CateringPreview />
    <StorySection />
    <ReservationPreview />
  </div>;
}
