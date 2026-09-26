import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { foodVisuals } from '@/data/food-visuals';
import { ServicePlanner } from './ServicePlanner';

export function Hero() {
  return <section className="home-hero" id="order" data-nav-section="home">
    <div className="hero-left">
      <div className="hero-copy">
        <span className="kicker">Mozza Italia · Made for sharing</span>
        <h1>Good food.<br />Made for <em>your moment.</em></h1>
        <p>Pizza, crispy chicken, burgers and comforting ghee pulav—ready for quick cravings and long tables alike.</p>
        <a className="hero-scroll-link" href="#explore">Explore the menu <ArrowDown size={17} /></a>
      </div>
      <ServicePlanner />
    </div>

    <div className="hero-visual">
      <Image
        src={foodVisuals.pizza}
        fill
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 820px) 100vw, 48vw"
        alt="Illustrative tomato, cheese and basil pizza"
      />
      <div className="hero-visual-note"><span>Freshly made</span><strong>For every kind of hungry</strong></div>
    </div>

  </section>;
}
