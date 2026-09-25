'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Locations', href: '/#locations' },
  { label: 'Catering', href: '/#catering' },
  { label: 'About', href: '/about' },
];

export function GlassNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <header className={`glass-navbar-wrap ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="glass-navbar">
      <Link href="/" className="nav-brand" aria-label="Mozza Italia home">
        <Image src="/brand/mozza-italia.png" width={52} height={52} alt="" loading="eager" />
        <span>Mozza Italia<small>Taste brings people together</small></span>
      </Link>
      <nav className="desktop-navigation" aria-label="Main navigation">
        {navigation.map(item => <Link key={item.label} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}
      </nav>
      <div className="navbar-actions">
        <Link className="nav-reserve" href="/#reservation">Reserve</Link>
        <Link className="button button-primary nav-order" href="/#order">Order now <ArrowRight size={17} /></Link>
        <button className="mobile-menu-trigger" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    <div className={`mobile-navigation-panel ${open ? 'is-open' : ''}`} id="mobile-navigation">
      <nav aria-label="Mobile navigation">
        {navigation.map(item => <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}<ArrowRight size={18} /></Link>)}
      </nav>
      <div className="mobile-navigation-actions">
        <Link className="button button-secondary" href="/#reservation" onClick={() => setOpen(false)}>Reserve a table</Link>
        <Link className="button button-primary" href="/#order" onClick={() => setOpen(false)}>Order now <ArrowRight size={17} /></Link>
      </div>
    </div>
  </header>;
}
