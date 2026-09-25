import { GlassNavbar } from './GlassNavbar';
import { Footer } from './Footer';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <GlassNavbar />
    <main id="main">{children}</main>
    <Footer />
  </>;
}

