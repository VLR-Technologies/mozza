import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, MessageCircle, Phone, PartyPopper, Store } from 'lucide-react';
import { branchAddress, branchDirectionsUrl, branches, callUrl, restaurant, whatsappIntentUrl, whatsappUrl } from '@/config/restaurant';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call or message Mozza Italia, find an outlet in Hyderabad, Shadnagar, Jadcherla or Guntur, or send a table or catering request.',
};

// Contact is the hub that points to each standalone route; the full directory,
// reservation and catering experiences live on their own pages.
export default function Contact() {
  return <>
    <section className="page-hero image-hero">
      <div className="image-hero-media"><Image src="/food/items/chicken-zinger-burger.webp" alt="" fill priority sizes="100vw" style={{ objectPosition: "center 30%" }} /></div>
      <div className="image-hero-copy">
        <span className="kicker">Contact Mozza Italia</span>
        <h1>We&rsquo;re a message away.</h1>
        <p>Call or WhatsApp the team for orders, timings and anything else. For tables, events and directions, jump straight to the right page below.</p>
      </div>
    </section>

    <section className="content-section">
      <div className="feature-grid feature-grid-3">
        <article className="feature-card">
          <span className="feature-icon"><Phone size={21} /></span>
          <h3>Call us</h3>
          <p>The main line reaches the restaurant team directly.</p>
          <a className="inline-link" href={callUrl}>{restaurant.phone} <ArrowRight size={15} /></a>
        </article>
        <article className="feature-card">
          <span className="feature-icon"><MessageCircle size={21} /></span>
          <h3>WhatsApp</h3>
          <p>Orders, timings and questions — the team replies on WhatsApp.</p>
          <a className="inline-link" href={whatsappIntentUrl('support', 'shadnagar')} target="_blank" rel="noreferrer">Message the team <ArrowRight size={15} /></a>
        </article>
        <article className="feature-card">
          <span className="feature-icon"><MapPin size={21} /></span>
          <h3>Visit an outlet</h3>
          <p>Maps, directions and ordering for every Mozza Italia outlet.</p>
          <Link className="inline-link" href="/locations">View locations <ArrowRight size={15} /></Link>
        </article>
        <article className="feature-card">
          <span className="feature-icon"><CalendarDays size={21} /></span>
          <h3>Reserve a table</h3>
          <p>Send a table request; staff confirm availability personally.</p>
          <Link className="inline-link" href="/reservation">Request a table <ArrowRight size={15} /></Link>
        </article>
        <article className="feature-card">
          <span className="feature-icon"><PartyPopper size={21} /></span>
          <h3>Catering &amp; events</h3>
          <p>Birthdays, office events, weddings and bulk orders.</p>
          <Link className="inline-link" href="/catering">Request a quote <ArrowRight size={15} /></Link>
        </article>
        <article className="feature-card">
          <span className="feature-icon"><Store size={21} /></span>
          <h3>Franchise enquiry</h3>
          <p>Interested in bringing Mozza Italia to your city? Start the conversation with the team.</p>
          <a className="inline-link" href={whatsappUrl('shadnagar', 'Hi Mozza Italia 👋\nI am interested in a Mozza Italia franchise. Please share the details.\n\nMy city:')} target="_blank" rel="noreferrer">Enquire on WhatsApp <ArrowRight size={15} /></a>
        </article>
      </div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="kicker">Our outlets</span><h2>Find us in {branches.length} cities.</h2></div><Link className="inline-link" href="/locations">Maps &amp; details <ArrowRight size={17} /></Link></div>
      <div className="reservation-branches">{branches.map(branch => <article className="reservation-branch" key={branch.id}>
        <span className="location-icon"><MapPin size={18} /></span>
        <div><h3>{branch.name}</h3><p>{branchAddress(branch)}</p></div>
        <a className="inline-link" href={branchDirectionsUrl(branch)} target="_blank" rel="noreferrer">Directions <ArrowRight size={15} /></a>
      </article>)}</div>
    </section>
  </>;
}
