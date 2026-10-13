import Link from 'next/link';
import { ArrowRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { branchAddress, branchDirectionsUrl, branches, callUrl, restaurant, whatsappIntentUrl } from '@/config/restaurant';
import { BranchMap } from '@/components/home/BranchMap';

// One card per outlet. Hours and per-branch phone numbers are only shown where
// the project actually has them — the rest ask the team rather than inventing
// opening times. See the note in config/restaurant.ts.
export function LocationsDirectory() {
  return <section className="content-section locations-directory" id="locations">
    <div className="section-heading">
      <div><span className="kicker">Four cities, one Mozza</span><h2>Choose your outlet</h2><p>Pick the outlet closest to you, check the map, and start an order or ask the team for today&rsquo;s timings.</p></div>
    </div>

    <div className="location-board">{branches.map(branch => <article className="location-panel" id={`location-${branch.id}`} key={branch.id}>
      <div className="location-panel-map"><BranchMap branch={branch} /></div>

      <div className="location-panel-body">
        <div className="location-panel-head">
          <span className="location-icon"><MapPin size={20} /></span>
          <div><h3>{branch.name}</h3><p>{branch.region}</p></div>
        </div>

        <dl className="location-facts">
          <div><dt>Address</dt><dd>{branchAddress(branch)}</dd></div>
          <div><dt><Clock size={14} /> Opening hours</dt><dd>{branch.hours || <span className="location-pending">Ask the team for today&rsquo;s timings</span>}</dd></div>
          <div><dt><Phone size={14} /> Phone</dt><dd>{branch.phone
            ? <a href={`tel:${branch.phone.replace(/\s/g, '')}`}>{branch.phone}</a>
            : <a href={callUrl}>{restaurant.phone} <span className="location-pending">(main line)</span></a>}</dd></div>
        </dl>

        <div className="location-panel-actions">
          <Link className="button button-primary" href={`/order?branch=${branch.id}`}>Order from {branch.name} <ArrowRight size={17} /></Link>
          <a className="button button-secondary" href={branchDirectionsUrl(branch)} target="_blank" rel="noreferrer">Directions <ArrowRight size={16} /></a>
          <a className="inline-link" href={whatsappIntentUrl('location', branch.name)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Ask about this outlet</a>
        </div>
      </div>
    </article>)}</div>
  </section>;
}
