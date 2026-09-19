import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/content',
          '/admins',
          '/students',
          '/regions',
          '/chapters',
          '/attendance',
          '/collections',
          '/reports',
          '/calendar',
          '/events',
          '/profile',
          '/regional',
          '/local',
          '/login',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
