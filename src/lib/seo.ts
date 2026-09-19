import type { Metadata } from 'next';

export const SITE_NAME = 'CASA UENR';

export const SITE_DESCRIPTION =
  'CASA UENR — Christ Apostolic Students and Associates at the University of Energy and Natural Resources. A student fellowship growing in the Word, prayer, and service.';

export const OG_IMAGE = '/og-image.png';

export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
})();

export const SOCIAL_LINKS: string[] = [];

export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE_NAME} logo` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
