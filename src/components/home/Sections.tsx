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

export function PromotionalSection({description = "Choose a location, find the dish that fits the mood, and prepare your order in a few simple steps."}: {description?: string} = {}) {
  return <section className="content-section promo-section">
    <div className="promo-image"><Image src={foodVisuals.rice} fill sizes="(max-width: 800px) 100vw, 52vw" alt="Illustrative Mozza Italia chicken ghee pulav" /></div>
    <div className="promo-copy"><span className="kicker">Made fresh for the moment</span><h2>Your favourites, ready when you are.</h2><p>{description}</p><Link className="button button-light" href="/menu">Explore the menu <ArrowRight size={18} /></Link></div>
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
        <p>Our menu makes room for different appetites at the same table. Choose pizza and burgers, crispy chicken and snacks, or settle into a meal of rice and ghee pulav. Salads, drinks and desserts give everyone a way to make the meal their own.</p>
        <p>Some visits are a quick bite between plans. Others are family meals, a catch-up with friends or a gathering that carries on over another helping. Mozza Italia is a place for those everyday moments, with familiar favourites and plenty to explore.</p>
        <p>We care about the details that make a meal worth returning to: balanced flavours, thoughtful preparation and a consistent experience. Our focus is on food you enjoy eating and feel comfortable sharing with the people around you.</p>
        <p>“Taste Brings People Together” is the idea at the heart of Mozza Italia. Whether you are choosing a favourite for yourself or ordering a spread for the table, we want the food to be part of time well spent together.</p>
      </div>
    </section>
    <section className="content-section about-values">
      <article><Utensils size={22} /><h3>Something for every mood</h3><p>From a snack and a cool drink to pizza, chicken or ghee pulav, there is room for different cravings. Round out the meal with a dessert, or come back to a familiar favourite.</p></article>
      <article><Heart size={22} /><h3>Made for sharing</h3><p>Pick a few dishes for the middle of the table, pass around the sides and let everyone find something they enjoy. Our variety makes it easy to bring different tastes together over one meal.</p></article>
    </section>
    <PromotionalSection description="A quick lunch, a relaxed dinner or a meal to share: start with the outlet that suits your plans. Browse the menu, choose your favourites and put together an order for your kind of gathering." />
  </>;
}
