import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Users, Utensils } from 'lucide-react';
import { branches } from '@/config/restaurant';
import { foodVisuals } from '@/data/food-visuals';

// Homepage teasers for the four standalone routes. The full Locations,
// Catering, Reservation and Order experiences live on their own pages now —
// these only introduce them and link across.
type PreviewProps = {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  image: string;
  alt: string;
  flip?: boolean;
  children?: React.ReactNode;
};

function PreviewBand({ id, kicker, title, copy, href, cta, image, alt, flip, children }: PreviewProps) {
  return <section className={`content-section preview-band ${flip ? 'preview-band-flip' : ''}`} id={id}>
    <div className="preview-media"><Image src={image} alt={alt} fill sizes="(max-width: 860px) 100vw, 48vw" /></div>
    <div className="preview-copy">
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      {children}
      <Link className="button button-primary" href={href}>{cta} <ArrowRight size={18} /></Link>
    </div>
  </section>;
}

export function OrderPreview() {
  return <PreviewBand
    id="order-preview"
    kicker="Pickup & dine-in"
    title="Craving Mozza?"
    copy="Search 118 dishes, pick your serving and build an order in a couple of taps. Checkout confirms the outlet and how you want it."
    href="/order"
    cta="Order now"
    image={foodVisuals.pizza}
    alt="Illustrative tomato, cheese and basil pizza"
  >
    <ul className="preview-points">
      <li><Utensils size={16} /> Full menu with sizes and prices</li>
      <li><MapPin size={16} /> Choose your outlet at checkout</li>
    </ul>
  </PreviewBand>;
}

export function LocationsPreview() {
  return <PreviewBand
    id="locations-preview"
    flip
    kicker={`${branches.length} cities, one Mozza`}
    title="Find your Mozza."
    copy="Maps, directions and ordering for every outlet across Telangana and Andhra Pradesh."
    href="/locations"
    cta="View locations"
    image={foodVisuals.grill}
    alt="Illustrative grilled chicken"
  >
    <ul className="preview-points preview-points-inline">
      {branches.map(branch => <li key={branch.id}><MapPin size={15} /> {branch.name}</li>)}
    </ul>
  </PreviewBand>;
}

export function CateringPreview() {
  return <PreviewBand
    id="catering-preview"
    kicker="Mozza for a crowd"
    title="Make your event delicious."
    copy="Birthdays, office events, weddings, private parties and bulk orders — planned with the team and priced to your headcount."
    href="/catering"
    cta="Explore catering"
    image={foodVisuals.chickenPizza}
    alt="Illustrative loaded Mozza Italia pizza"
  >
    <ul className="preview-points">
      <li><Users size={16} /> From under 10 to 100+ guests</li>
      <li><Utensils size={16} /> Veg and non-veg prepared separately</li>
    </ul>
  </PreviewBand>;
}

export function ReservationPreview() {
  return <PreviewBand
    id="reservation-preview"
    kicker="A table for your people"
    title="Your table awaits."
    copy="Send a table request to your preferred outlet. The team confirms availability personally — no automated bookings."
    href="/reservation"
    cta="Reserve a table"
    image={foodVisuals.rice}
    alt="Illustrative chicken ghee pulav"
  >
    <ul className="preview-points">
      <li><CalendarDays size={16} /> Pick your date, time and guest count</li>
    </ul>
  </PreviewBand>;
}
