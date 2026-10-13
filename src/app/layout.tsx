import type { Metadata } from 'next';
import { branches, restaurant } from '@/config/restaurant';
import { SiteShell } from '@/components/layout/SiteShell';
import { introGateScript, introScript } from '@/lib/intro';
import './fonts.css';
import './globals.css';
const title = 'Mozza Italia | Pizza, Crispy Chicken, Burgers & Ghee Pulav';
const description = 'Explore Mozza Italia in Hyderabad, Shadnagar, Jadcherla and Guntur. Browse pizza, crispy chicken, burgers, ghee pulav, drinks and desserts.';
export const metadata: Metadata = {
  title: { default: title, template: '%s | Mozza Italia' }, description,
  ...(restaurant.siteUrl ? { metadataBase: new URL(restaurant.siteUrl) } : {}),
  openGraph: { title, description, type: 'website', locale: 'en_IN', siteName: restaurant.name },
  icons: { icon: '/brand/mozza-italia.png' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { '@context': 'https://schema.org', '@type': 'Restaurant', name: restaurant.name, telephone: restaurant.phone, servesCuisine: ['Pizza','Burgers','Indian'], areaServed: branches.map(branch => ({ '@type': 'City', name: branch.name })), ...(restaurant.siteUrl ? { url:restaurant.siteUrl } : {}) };
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: introGateScript }} /></head><body>{/* Delivered as raw HTML so the browser runs it while parsing and React never renders a <script> element. */}<div hidden suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `<script>${introScript}</script>` }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><SiteShell>{children}</SiteShell></body></html>;
}

