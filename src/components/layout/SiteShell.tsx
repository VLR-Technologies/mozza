import { GlassNavbar } from './GlassNavbar';
import { OrderProvider } from '@/components/order/OrderProvider';
import { Footer } from './Footer';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <OrderProvider>
    <a className="skip-link" href="#main">Skip to content</a>
    <GlassNavbar />
    <main id="main">{children}</main>
    <Footer />
  </OrderProvider>;
}

