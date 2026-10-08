import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Utensils } from 'lucide-react';
import { foodVisuals } from '@/data/food-visuals';

export function StorySection() {
  return <section className="content-section story-section">
    <div className="story-image"><Image src={foodVisuals.burger} fill sizes="(max-width: 800px) 100vw, 48vw" alt="Illustrative crispy chicken burger" /></div>
    <div className="story-copy"><span className="kicker">This is Mozza Italia</span><h2>Food tastes better together.</h2><p>Familiar favourites made for sharing — pizza, crispy chicken, burgers, ghee pulav and something sweet.</p><Link className="inline-link" href="/about">Our story <ArrowRight size={17} /></Link></div>
  </section>;
}

export function PromotionalSection() {
  return <section className="content-section promo-section">
    <div className="promo-image"><Image src={foodVisuals.rice} fill sizes="(max-width: 800px) 100vw, 52vw" alt="Illustrative Mozza Italia chicken ghee pulav" /></div>
    <div className="promo-copy"><span className="kicker">Made fresh for the moment</span><h2>Your favourites, ready when you are.</h2><p>Choose a location, find the dish that fits the mood, and prepare your order in a few simple steps.</p><Link className="button button-light" href="/menu">Explore the menu <ArrowRight size={18} /></Link></div>
  </section>;
}

export function AboutContent() {
  return <>
    {/* Chef from the logo on the left; heading and story text on the right. */}
    <section className="content-section about-intro">
      <div className="about-chef"><Image src="/brand/mozza-chef-portrait.png" alt="The Mozza Italia chef" width={1020} height={1301} sizes="(max-width: 800px) 60vw, 30vw" /></div>
      <div className="about-intro-copy">
        <span className="kicker">Taste brings people together</span>
        <h2>Comfort food for every kind of company.</h2>
        <p>We believe a good meal does more than satisfy a craving. It gives people a reason to pause, share, laugh, and stay a little longer.</p>
        <p>Mozza Italia brings together pizza, crispy chicken, burgers, salads, ghee pulav, drinks and desserts on one generous menu.</p>
        <p>Every dish is cooked fresh in our kitchen, with recipes we have perfected over time and ingredients we pick with care. From fragrant ghee pulav to cheesy pizza, we keep the flavours honest, so every bite tastes just the way it should.</p>
      </div>
    </section>
    <section className="content-section about-values">
      <article><Utensils size={22} /><h3>Something for every mood</h3><p>Quick bites, complete meals, family portions and a sweet finish—all from the real menu.</p></article>
      <article><Heart size={22} /><h3>Made for sharing</h3><p>A menu designed for solo cravings, family dinners and celebrations around a full table.</p></article>
    </section>
    <PromotionalSection />
  </>;
}
