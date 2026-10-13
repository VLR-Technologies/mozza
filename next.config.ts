import type { NextConfig } from 'next';
import { getSeoConfig } from './src/config/seo';

const { indexable } = getSeoConfig();
const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/webp'] },
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      ...(!indexable ? [{ source: '/:path*', headers: noindex }] : []),
      { source: '/admin/:path*', headers: noindex },
      { source: '/api/:path*', headers: noindex },
    ];
  },
};
export default config;
