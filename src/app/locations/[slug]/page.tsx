import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { branchDirectionsUrl, branches, whatsappIntentUrl } from '@/config/restaurant';
import { outletContent, pageMetadata } from '@/lib/seo';
import { outletSchema } from '@/lib/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BranchMap } from '@/components/home/BranchMap';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return branches.map(branch => ({ slug: branch.id }));
}

function getOutlet(slug: string) {
  const branch = branches.find(branch => branch.id === slug);
  if (!branch || !outletContent[slug]) notFound();
  return branch;
}

export async function generateMetadata({ params }: Props) {
  const branch = getOutlet((await params).slug);
  return pageMetadata(`/locations/${branch.id}`);
}

export default async function OutletPage({ params }: Props) {
  const branch = getOutlet((await params).slug);
  const content = outletContent[branch.id];
  return <>
    <JsonLd data={outletSchema(branch)} />
    <section className="page-hero">
      <span className="kicker">{branch.region} · Mozza Italia</span>
      <h1>Mozza Italia {branch.name}</h1>
      <p>{content.introduction}</p>
      <div className="hero-cta-row">
        <Link className="button button-primary" href={`/order?branch=${branch.id}`}>Order from {branch.name} <ArrowRight size={17} /></Link>
        {branch.phone && <a className="button button-secondary" href={`tel:${branch.phone.replace(/\s/g, '')}`}><Phone size={16} /> {branch.phone}</a>}
      </div>
    </section>

    <section className="content-section outlet-details">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Locations', path: '/locations' }, { name: branch.name, path: `/locations/${branch.id}` }]} />
      <div className="location-panel">
        <div className="location-panel-map"><BranchMap branch={branch} /></div>
        <div className="location-panel-body">
          <div><span className="kicker">Plan your visit</span><h2>{content.visitTitle}</h2><p>{content.visit}</p></div>
          <dl className="location-facts">
            <div><dt><MapPin size={14} /> Address</dt><dd><address>{branch.address}</address></dd></div>
            <div><dt><Clock size={14} /> Opening hours</dt><dd>{branch.hours || 'Contact this outlet for today’s opening hours.'}</dd></div>
            {branch.phone && <div><dt><Phone size={14} /> Phone</dt><dd><a href={`tel:${branch.phone.replace(/\s/g, '')}`}>{branch.phone}</a></dd></div>}
          </dl>
          <div className="location-panel-actions">
            <a className="button button-secondary" href={branchDirectionsUrl(branch)} target="_blank" rel="noreferrer">Directions to {branch.name} <ArrowRight size={16} /></a>
            <a className="inline-link" href={whatsappIntentUrl('location', branch.id)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Message the {branch.name} team</a>
          </div>
        </div>
      </div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="kicker">Before you order</span><h2>Menu, tables and events in {branch.name}</h2><p>Staff confirm current availability, service options and timings for your request.</p></div></div>
      <div className="feature-grid feature-grid-3">
        <article className="feature-card"><h3>Choose your food</h3><p>Browse pizza, crispy chicken, burgers, ghee pulav and more, with serving sizes and menu prices.</p><Link className="inline-link" href={`/menu?branch=${branch.id}`}>Browse the menu for {branch.name} <ArrowRight size={15} /></Link></article>
        <article className="feature-card"><h3>Plan a table</h3><p>Ask this outlet about your visit, or submit a table request and choose {branch.name} in the reservation form. Staff confirm the booking.</p><Link className="inline-link" href="/reservation">Request a table <ArrowRight size={15} /></Link><a className="inline-link" href={whatsappIntentUrl('reservation', branch.id)} target="_blank" rel="noreferrer">Ask {branch.name} about a table</a></article>
        <article className="feature-card"><h3>Food for a gathering</h3><p>Share your event date and guest count with the {branch.name} team to discuss catering or a bulk order.</p><Link className="inline-link" href="/catering">Send a catering enquiry <ArrowRight size={15} /></Link><a className="inline-link" href={whatsappIntentUrl('catering', branch.id)} target="_blank" rel="noreferrer">Discuss catering with {branch.name}</a></article>
      </div>
    </section>

    <section className="content-section section-tight-top">
      <div className="section-heading"><div><h2>Other Mozza Italia outlets</h2></div><Link className="inline-link" href="/locations">All locations <ArrowRight size={17} /></Link></div>
      <nav aria-label="Other outlets" className="outlet-links">{branches.filter(other => other.id !== branch.id).map(other => <Link key={other.id} className="button button-secondary" href={`/locations/${other.id}`}>Mozza Italia {other.name} <ArrowRight size={15} /></Link>)}</nav>
    </section>
  </>;
}
