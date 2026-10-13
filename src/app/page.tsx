import { Hero } from '@/components/home/Hero';
import { CuisineCategories } from '@/components/home/CuisineCategories';
import { PopularItems } from '@/components/home/PopularItems';
import { StorySection } from '@/components/home/Sections';
import { CateringPreview, LocationsPreview, OrderPreview, ReservationPreview } from '@/components/home/Previews';
import { pageMetadata } from '@/lib/seo';
import { homepageSchema } from '@/lib/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageMetadata('/');

export default function Home() {
  return <div className="home-page">
    <JsonLd data={homepageSchema()} />
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
