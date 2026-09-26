'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

type HomeSection = 'home' | 'locations' | 'catering';
type NavigationItem = { label: string; href: string; section?: HomeSection };

const navigation: readonly NavigationItem[] = [
  { label: 'Home', href: '/', section: 'home' },
  { label: 'Menu', href: '/menu' },
  { label: 'Locations', href: '/#locations', section: 'locations' },
  { label: 'Catering', href: '/#catering', section: 'catering' },
  { label: 'About', href: '/about' },
];

export function GlassNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [homeSection, setHomeSection] = useState<HomeSection>('home');

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-section]'));
    const visibleSections = new Map<HomeSection, number>();
    let animationFrame = 0;

    const updateActiveSection = () => {
      const active = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'home';
      setHomeSection(active);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const section = (entry.target as HTMLElement).dataset.navSection as HomeSection;
        if (entry.isIntersecting) visibleSections.set(section, entry.intersectionRatio);
        else visibleSections.delete(section);
      });
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateActiveSection);
    }, { rootMargin: '-28% 0px -60% 0px', threshold: [0, .01, .5, 1] });

    sections.forEach(section => observer.observe(section));
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [pathname]);

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

  function isActive(item: NavigationItem) {
    if (pathname === '/') return item.section === homeSection;
    return item.href === pathname;
  }

  function followNavigation(event: MouseEvent<HTMLAnchorElement>, item: NavigationItem) {
    setOpen(false);
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const section = item.section;
    if (!section || pathname !== '/') return;

    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (section === 'home') {
      setHomeSection('home');
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const target = document.getElementById(section);
    if (!target) return;
    setHomeSection(section);
    window.history.pushState(null, '', `/#${section}`);
    target.scrollIntoView({ behavior, block: 'start' });
  }

  return <header className={`glass-navbar-wrap ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="glass-navbar">
      <Link href="/" className="nav-brand" aria-label="Mozza Italia home">
        <Image src="/brand/mozza-italia.png" width={52} height={52} alt="" loading="eager" />
        <span>Mozza Italia<small>Taste brings people together</small></span>
      </Link>
      <nav className="desktop-navigation" aria-label="Main navigation">
        {navigation.map(item => {
          const active = isActive(item);
          return <Link key={item.label} href={item.href} aria-current={active ? (item.section === 'locations' || item.section === 'catering' ? 'location' : 'page') : undefined} onClick={event => followNavigation(event, item)}>{item.label}</Link>;
        })}
      </nav>
      <div className="navbar-actions">
        <Link className="nav-reserve" href="/#reservation">Reserve</Link>
        <Link className="button button-primary nav-order" href="/#order">Order now <ArrowRight size={17} /></Link>
        <button className="mobile-menu-trigger" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    <div className={`mobile-navigation-panel ${open ? 'is-open' : ''}`} id="mobile-navigation">
      <nav aria-label="Mobile navigation">
        {navigation.map(item => {
          const active = isActive(item);
          return <Link key={item.label} href={item.href} aria-current={active ? (item.section === 'locations' || item.section === 'catering' ? 'location' : 'page') : undefined} onClick={event => followNavigation(event, item)}>{item.label}<ArrowRight size={18} /></Link>;
        })}
      </nav>
      <div className="mobile-navigation-actions">
        <Link className="button button-secondary" href="/#reservation" onClick={() => setOpen(false)}>Reserve a table</Link>
        <Link className="button button-primary" href="/#order" onClick={() => setOpen(false)}>Order now <ArrowRight size={17} /></Link>
      </div>
    </div>
  </header>;
}
