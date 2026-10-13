import type { MetadataRoute } from 'next';
import { getSeoConfig } from '@/config/seo';
import { canonicalUrl, indexablePaths } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!getSeoConfig().indexable) return [];
  return indexablePaths.map(path => ({ url: canonicalUrl(path)! }));
}
