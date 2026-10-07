import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { branches, callUrl, restaurant, whatsappIntentUrl } from '@/config/restaurant';
import { foodVisuals } from '@/data/food-visuals';
import { LocationsDirectory } from '@/components/locations/LocationsDirectory';

export const metadata: Metadata = {
  title: 'Locations',
  description: `Find Mozza Italia in ${branches.map(branch => branch.name).join(', ')}. Addresses, maps, directions and ordering for every outlet.`,
};

export default function LocationsPage() {
  return <>
    <section className="page-hero image-hero">
      <div className="image-hero-media"><Image src={foodVisuals.chickenPizza} alt="" fill priority sizes="100vw" /></div>
      <div className="image-hero-copy">
        <span className="kicker">{branches.length} cities · Telangana &amp; Andhra Pradesh</span>
        <h1>Find your Mozza.</h1>
        <p>The same menu, the same kitchen standards, in {branches.map(branch => branch.name).join(', ')}. Choose an outlet to see the map, get directions, or start an order.</p>
        <div className="hero-cta-row">
          <Link className="button button-primary" href="/order">Start an order <ArrowRight size={17} /></Link>
          <a className="button button-light" href={callUrl}><Phone size={16} /> {restaurant.phone}</a>
        </div>
      </div>
    </section>

    <LocationsDirectory />

    <section className="content-section cta-band">
      <div><span className="kicker">Not sure which outlet?</span><h2>Message the team and we will point you to the nearest one.</h2></div>
      <a className="button button-primary" href={whatsappIntentUrl('location')} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Ask on WhatsApp</a>
    </section>
  </>;
}
