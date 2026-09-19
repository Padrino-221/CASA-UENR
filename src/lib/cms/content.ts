import { db } from '@/lib/prisma';
import { getCmsPage, defaultContentForPage } from './schema';

export type ContentMap = Record<string, string>;

export async function getPageContent(pageSlug: string, preview = false): Promise<ContentMap> {
  const page = getCmsPage(pageSlug);
  const out: ContentMap = page ? defaultContentForPage(page) : {};

  try {
    const rows = await db.siteContent.findMany({ where: { page: pageSlug } });
    for (const row of rows) {
      const key = `${row.section}.${row.field}`;
      const value = preview ? row.value : row.publishedValue;
      if (value !== null && value !== undefined) out[key] = value;
    }
  } catch {
    // Database unavailable — fall back to defaults so the site still renders.
  }
  return out;
}

export async function getGlobalContent(preview = false): Promise<ContentMap> {
  return getPageContent('global', preview);
}

export { parseList, parseTags, parseParagraphs, parseLines } from './parse';
