import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { foodVisuals } from '@/data/food-visuals';
import { whatsappUrl } from '@/config/restaurant';

export function CateringBanner() {
  return <section className="content-section catering-banner" id="catering">
    <div className="catering-image"><Image src={foodVisuals.chickenPizza} alt="Illustrative loaded Mozza Italia pizza" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
    <div className="catering-copy"><span className="kicker">Mozza for a crowd</span><h2>Planning something bigger?</h2><p>From birthdays and office lunches to parties, celebrations and bulk orders, build the food plan with our team.</p><ul><li>Birthdays & celebrations</li><li>Office events</li><li>Private parties</li><li>Bulk orders</li></ul><a className="button button-light" href={whatsappUrl('Hello Mozza Italia, I would like to plan catering for an upcoming event. Please share the available options.')} target="_blank" rel="noreferrer">Plan catering <ArrowRight size={18} /></a></div>
  </section>;
}
