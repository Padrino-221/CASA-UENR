import { getPageContent, getGlobalContent } from './content';
import { getCmsPage } from './schema';
import { cmsText } from './display';
import { pageMetadata, SITE_NAME } from '@/lib/seo';

export async function cmsPageMetadata(slug: string, preview = false) {
  const [content, global] = await Promise.all([getPageContent(slug, preview), getGlobalContent(preview)]);
  const page = getCmsPage(slug)!;
  const result = pageMetadata({ title: cmsText(content['seo.title']), description: content['seo.description'], path: page.path, image: content['seo.image'] || undefined });
  if (result.openGraph) result.openGraph.siteName = global['brand.siteName'] || SITE_NAME;
  result.title = { absolute: slug === 'home' ? cmsText(content['seo.title']) : `${cmsText(content['seo.title'])} | ${global['brand.siteName'] || SITE_NAME}` };
  if (preview) result.robots = { index: false, follow: false };
  return result;
}
