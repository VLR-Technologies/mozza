import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react';
import { branches, callUrl, restaurant, whatsappIntentUrl } from '@/config/restaurant';

const explore = [['Menu', '/menu'], ['Locations', '/#locations'], ['Catering', '/#catering'], ['Reservations', '/#reservation']];

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand">
        <Link href="/" aria-label="Mozza Italia home"><Image src="/brand/mozza-italia.png" width={72} height={72} alt="" /><span>Mozza Italia</span></Link>
        <p>Pizza, crispy chicken, burgers, ghee pulav and good times—made for sharing.</p>
      </div>
      <div className="footer-column"><h2>Explore</h2>{explore.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</div>
      <div className="footer-column"><h2>Locations</h2>{branches.map(branch => <Link key={branch.id} href={`/#location-${branch.id}`}>{branch.name}</Link>)}</div>
      <div className="footer-column footer-contact"><h2>Support</h2><a href={callUrl}><Phone size={16} /> {restaurant.phone}</a><a href={whatsappIntentUrl('support')} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp <ArrowUpRight size={14} /></a><Link href="/contact">Contact</Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Mozza Italia</span><span>Food visuals are illustrative. Actual presentation may vary.</span><Link href="/privacy">Privacy</Link></div>
  </footer>;
}
