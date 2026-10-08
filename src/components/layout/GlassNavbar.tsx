'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, ShoppingBag, X } from 'lucide-react';

import { useOrder } from '@/components/order/OrderProvider';

type NavigationItem = { label: string; href: string };

// Every destination is a real route — no homepage anchors.
const navigation: readonly NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Locations', href: '/locations' },
  { label: 'Catering', href: '/catering' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function GlassNavbar() {
  const order = useOrder();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  // '/' only matches exactly; every other route also matches its sub-paths.
  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  }

  return <header className={`glass-navbar-wrap ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="glass-navbar">
      <Link href="/" className="nav-brand" aria-label="Mozza Italia home">
        <Image src="/brand/mozza-italia-logo.png" width={1600} height={649} alt="Mozza Italia" sizes="160px" loading="eager" />
        <span><small>Taste brings people together</small></span>
      </Link>
      <nav className="desktop-navigation" aria-label="Main navigation">
        {navigation.map(item => <Link key={item.label} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}
      </nav>
      <div className="navbar-actions">
        <Link className="nav-reserve" href="/reservation" aria-current={isActive('/reservation') ? 'page' : undefined}>Reserve</Link>
        {order.count > 0 && <button className="nav-cart" type="button" onClick={order.open} aria-label={`View your order (${order.count} items)`}><ShoppingBag size={18} /><span>{order.count}</span></button>}
        <Link className="button button-primary nav-order" href="/order" aria-current={isActive('/order') ? 'page' : undefined}>Order now <ArrowRight size={17} /></Link>
        <button className="mobile-menu-trigger" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    <div className={`mobile-navigation-panel ${open ? 'is-open' : ''}`} id="mobile-navigation">
      <nav aria-label="Mobile navigation">
        {navigation.map(item => <Link key={item.label} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}<ArrowRight size={18} /></Link>)}
      </nav>
      <div className="mobile-navigation-actions">
        <Link className="button button-secondary" href="/reservation" onClick={() => setOpen(false)}>Reserve a table</Link>
        <Link className="button button-primary" href="/order" onClick={() => setOpen(false)}>Order now{order.count > 0 && ` (${order.count})`} <ArrowRight size={17} /></Link>
      </div>
    </div>
  </header>;
}
