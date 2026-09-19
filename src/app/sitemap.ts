import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getPublishedArticles } from '@/lib/cms/news';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/departments`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getPublishedArticles();
    articleRoutes = articles.map((article) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: article.date ? new Date(article.date) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    articleRoutes = [];
  }

  return [...staticRoutes, ...articleRoutes];
}
