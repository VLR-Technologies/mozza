import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, Briefcase, Cake, HeartHandshake, PartyPopper, Soup, Truck, Users } from 'lucide-react';
import { foodVisuals } from '@/data/food-visuals';
import { branches } from '@/config/restaurant';
import { CateringEnquiryForm } from '@/components/catering/CateringEnquiryForm';

export const metadata: Metadata = {
  title: 'Catering',
  description: 'Catering from Mozza Italia for corporate events, weddings, birthdays, private gatherings and bulk orders across Hyderabad, Shadnagar, Jadcherla and Guntur.',
};

// Event types mirror the enquiry form's validated options so the page never
// advertises something the form cannot submit.
const occasions = [
  { icon: Briefcase, title: 'Corporate events', copy: 'Office lunches, launches and team days, packed to travel and served on time.' },
  { icon: HeartHandshake, title: 'Weddings & engagements', copy: 'Pizza counters, broasted chicken and pulav for the pre-wedding run of events.' },
  { icon: Cake, title: 'Birthday parties', copy: 'Crowd-pleasers kids and adults agree on, with a sweet finish to close.' },
  { icon: PartyPopper, title: 'Private gatherings', copy: 'House parties, reunions and college events — portioned for sharing.' },
];

const benefits = [
  { icon: Users, title: 'Built around your headcount', copy: 'From under 10 to 100+, the team sizes portions to your guest count rather than a fixed package.' },
  { icon: Soup, title: 'Veg and non-veg together', copy: 'Mixed menus are standard. Vegetarian dishes are prepared and packed separately.' },
  { icon: Truck, title: 'Pickup or venue service', copy: 'Collect from your nearest outlet, or ask about delivery to your venue when you enquire.' },
];

const gallery = [
  { src: foodVisuals.pizza, alt: 'Illustrative tomato, cheese and basil pizza' },
  { src: '/food/items/chicken-hot-wings.webp', alt: 'Illustrative juicy, saucy chicken hot wings' },
  { src: foodVisuals.rice, alt: 'Illustrative chicken ghee pulav' },
  { src: '/food/items/gulab-jamun-2-pcs-with-rabdi.webp', alt: 'Illustrative gulab jamun with rabdi' },
  { src: foodVisuals.garlic, alt: 'Illustrative garlic bread' },
  { src: foodVisuals.desserts, alt: 'Illustrative chocolate brownie' },
];

export default function CateringPage() {
  return <>
    <section className="page-hero image-hero">
      {/* Vegetarian-friendly hero: plain biryani-style basmati rather than chicken. */}
      <div className="image-hero-media"><Image src="/food/items/extra-basmathi-rice.webp" alt="" fill priority sizes="100vw" /></div>
      <div className="image-hero-copy">
        <span className="kicker">Mozza for a crowd</span>
        <h1>Make your event delicious.</h1>
        <p>Birthdays, office events, weddings, private parties and bulk orders — planned with the team at your nearest outlet across {branches.length} cities.</p>
        <div className="hero-cta-row">
          <a className="button button-primary" href="#catering-form">Request catering quote <ArrowRight size={17} /></a>
        </div>
      </div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="kicker">What we cater</span><h2>Food that suits the occasion.</h2><p>Tell us the kind of event and the team builds the plan around it.</p></div></div>
      <div className="feature-grid">{occasions.map(({ icon: Icon, title, copy }) => <article className="feature-card" key={title}>
        <span className="feature-icon"><Icon size={21} /></span><h3>{title}</h3><p>{copy}</p>
      </article>)}</div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="kicker">How it works</span><h2>Straightforward from the first message.</h2></div></div>
      <div className="feature-grid feature-grid-3">{benefits.map(({ icon: Icon, title, copy }) => <article className="feature-card" key={title}>
        <span className="feature-icon"><Icon size={21} /></span><h3>{title}</h3><p>{copy}</p>
      </article>)}</div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="kicker">From the menu</span><h2>What lands on the table.</h2><p>Catering is built from the same menu you can browse today. Food imagery is illustrative.</p></div></div>
      <div className="catering-gallery">{gallery.map(photo => <div className="catering-gallery-tile" key={photo.src}>
        <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 50vw, 32vw" />
      </div>)}</div>
    </section>

    <section className="content-section">
      <CateringEnquiryForm />
    </section>
  </>;
}
