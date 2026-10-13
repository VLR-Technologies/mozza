import { branches, restaurant, type Branch } from '@/config/restaurant';
import { getSeoConfig } from '@/config/seo';
import { canonicalUrl } from '@/lib/seo';

// Escape script delimiters as well as the JS line separator characters. Values
// round-trip through JSON.parse without allowing HTML/script injection.
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function homepageSchema() {
  const { origin } = getSeoConfig();
  if (!origin) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${origin}/#organization`,
        name: restaurant.name, url: canonicalUrl('/'), logo: `${origin}/brand/mozza-italia-logo.png`,
        subOrganization: branches.map(branch => ({ '@id': `${origin}/locations/${branch.id}#restaurant` })),
      },
      {
        '@type': 'WebSite', '@id': `${origin}/#website`, name: restaurant.name,
        url: canonicalUrl('/'), inLanguage: 'en', publisher: { '@id': `${origin}/#organization` },
      },
    ],
  };
}

export type Breadcrumb = { name: string; path: string };

export function breadcrumbSchema(items: Breadcrumb[]) {
  if (!getSeoConfig().origin) return null;
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl(items[items.length - 1].path)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: canonicalUrl(item.path),
    })),
  };
}

export function outletSchema(branch: Branch) {
  const { origin } = getSeoConfig();
  if (!origin) return null;
  const url = canonicalUrl(`/locations/${branch.id}`);
  return {
    '@context': 'https://schema.org', '@type': 'Restaurant', '@id': `${url}#restaurant`,
    name: `${restaurant.name} ${branch.name}`, url,
    parentOrganization: { '@id': `${origin}/#organization` },
    ...(branch.phone ? { telephone: branch.phone.replace(/\s/g, '') } : {}),
    ...(branch.postalAddress ? { address: { '@type': 'PostalAddress', ...branch.postalAddress } } : {}),
    hasMenu: `${origin}/menu`,
  };
}
