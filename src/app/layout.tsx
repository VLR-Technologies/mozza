import type { Metadata } from 'next';
import { restaurant } from '@/config/restaurant';
import { SiteShell } from '@/components/layout/SiteShell';
import './fonts.css';
import './globals.css';
const title = 'Mozza Italia Shadnagar | Pizza, Broasted Chicken, Burgers & Ghee Pulav';
const description = 'Good food. Good mood. Explore pizza, broasted chicken, burgers and ghee pulav at Mozza Italia, Shadnagar. Browse the menu and connect with us on WhatsApp.';
export const metadata: Metadata = {
  title: { default: title, template: '%s | Mozza Italia Shadnagar' }, description,
  ...(restaurant.siteUrl ? { metadataBase: new URL(restaurant.siteUrl) } : {}),
  openGraph: { title, description, type: 'website', locale: 'en_IN', siteName: restaurant.name },
  icons: { icon: '/brand/mozza-italia.png' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { '@context': 'https://schema.org', '@type': 'Restaurant', name: 'Mozza Italia Shadnagar', telephone: restaurant.phone, servesCuisine: ['Pizza','Burgers','Indian'], address: { '@type':'PostalAddress', addressLocality:'Shadnagar', addressRegion:'Telangana', addressCountry:'IN' }, ...(restaurant.siteUrl ? { url:restaurant.siteUrl } : {}) };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><SiteShell>{children}</SiteShell></body></html>;
}

