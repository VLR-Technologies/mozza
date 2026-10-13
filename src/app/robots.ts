import type { MetadataRoute } from 'next';
import { getSeoConfig } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
  const { origin, indexable } = getSeoConfig();
  return indexable ? {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${origin}/sitemap.xml`,
  } : { rules: { userAgent: '*', disallow: '/' } };
}
