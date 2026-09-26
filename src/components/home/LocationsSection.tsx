import Link from 'next/link';
import { ArrowRight, MapPin, MessageCircle } from 'lucide-react';
import { branches, whatsappIntentUrl } from '@/config/restaurant';

export function LocationsSection() {
  return <section className="content-section locations-section" id="locations" data-nav-section="locations">
    <div className="section-heading"><div><span className="kicker">Four cities, one Mozza</span><h2>Find your nearest Mozza</h2><p>Choose your city, browse the menu, and let the team confirm current availability.</p></div></div>
    <div className="locations-grid">{branches.map(branch => <article className="location-card" id={`location-${branch.id}`} key={branch.id}>
      <span className="location-icon"><MapPin size={22} /></span>
      <div><h3>{branch.name}</h3><p>{branch.address || branch.region}</p>{branch.hours && <small>{branch.hours}</small>}</div>
      <div className="location-actions"><Link href={`/menu?branch=${branch.id}`}>Order pickup <ArrowRight size={15} /></Link>{branch.googleMapsUrl ? <a href={branch.googleMapsUrl} target="_blank" rel="noreferrer">Directions <ArrowRight size={15} /></a> : <a href={whatsappIntentUrl('location', branch.name)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Outlet details</a>}</div>
    </article>)}</div>
  </section>;
}
