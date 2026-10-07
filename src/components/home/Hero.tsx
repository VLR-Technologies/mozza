import { ArrowDown } from 'lucide-react';
import { ServicePlanner } from './ServicePlanner';
import { HeroFoodPath } from './HeroFoodPath';

export function Hero() {
  return <section className="home-hero">
    <div className="hero-left">
      <div className="hero-copy">
        <span className="kicker">Mozza Italia · Made for sharing</span>
        <h1>Good food.<br />Made for <em>your moment.</em></h1>
        <p>Pizza, crispy chicken, burgers and comforting ghee pulav—ready for quick cravings and long tables alike.</p>
        <a className="hero-scroll-link" href="#explore">Explore the menu <ArrowDown size={17} /></a>
      </div>
      <ServicePlanner />
    </div>

    <div className="hero-visual hero-visual-dishes">
      <HeroFoodPath />
      <div className="hero-visual-note"><span>Freshly made</span><strong>For every kind of hungry</strong></div>
    </div>

  </section>;
}
