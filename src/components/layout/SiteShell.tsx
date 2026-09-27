'use client';
import { usePathname } from 'next/navigation';
import { GlassNavbar } from './GlassNavbar';
import { OrderProvider } from '@/components/order/OrderProvider';
import { Footer } from './Footer';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <main id="main">{children}</main>;
  return <OrderProvider>
    <a className="skip-link" href="#main">Skip to content</a>
    <GlassNavbar />
    <main id="main">{children}</main>
    <Footer />
  </OrderProvider>;
}

