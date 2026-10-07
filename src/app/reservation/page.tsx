import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { branchAddress, branches, callUrl, restaurant, whatsappIntentUrl } from '@/config/restaurant';
import { foodVisuals } from '@/data/food-visuals';
import { ReservationForm } from '@/components/reservation/ReservationForm';

export const metadata: Metadata = {
  title: 'Reserve a table',
  description: 'Request a table at Mozza Italia in Hyderabad, Shadnagar, Jadcherla or Guntur. Choose your date, time and guest count — the team confirms on WhatsApp.',
};

export default function ReservationPage() {
  return <>
    <section className="page-hero image-hero">
      <div className="image-hero-media"><Image src={foodVisuals.rice} alt="" fill priority sizes="100vw" /></div>
      <div className="image-hero-copy">
        <span className="kicker">Dine in with us</span>
        <h1>Your table awaits.</h1>
        <p>Tell us when you are coming and how many are joining. The team confirms availability personally — no automated bookings, no guesswork.</p>
        <div className="hero-cta-row">
          <a className="button button-primary" href="#reservation">Request a table <ArrowRight size={17} /></a>
          <a className="button button-light" href={callUrl}><Phone size={16} /> {restaurant.phone}</a>
        </div>
      </div>
    </section>

    <ReservationForm />

    <section className="content-section section-tight-bottom">
      <div className="section-heading"><div><span className="kicker">Before you arrive</span><h2>Good to know.</h2></div></div>
      <div className="feature-grid feature-grid-3">
        <article className="feature-card"><span className="feature-icon"><Clock size={21} /></span><h3>Opening hours</h3><p>{restaurant.hours || 'Hours vary by outlet. The team confirms the day’s timings when they reply to your request.'}</p></article>
        <article className="feature-card"><span className="feature-icon"><MessageCircle size={21} /></span><h3>How confirmation works</h3><p>Your request is saved for the restaurant with a reference. Staff reply on WhatsApp to confirm the table — it is not booked until they do.</p></article>
        <article className="feature-card"><span className="feature-icon"><Phone size={21} /></span><h3>Prefer to call?</h3><p><a className="inline-link" href={callUrl}>{restaurant.phone}</a> reaches the main line, or <a className="inline-link" href={whatsappIntentUrl('reservation')} target="_blank" rel="noreferrer">message on WhatsApp</a>.</p></article>
      </div>
    </section>

    <section className="content-section section-tight-top">
      <div className="section-heading"><div><span className="kicker">Where to find us</span><h2>Choose your outlet.</h2></div><Link className="inline-link" href="/locations">All locations <ArrowRight size={17} /></Link></div>
      <div className="reservation-branches">{branches.map(branch => <article className="reservation-branch" key={branch.id}>
        <span className="location-icon"><MapPin size={18} /></span>
        <div><h3>{branch.name}</h3><p>{branchAddress(branch)}</p></div>
        <Link className="inline-link" href={`/locations#location-${branch.id}`}>Map &amp; directions <ArrowRight size={15} /></Link>
      </article>)}</div>
    </section>
  </>;
}
