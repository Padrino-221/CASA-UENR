import { CMS_KEY_ALIASES } from './aliases';
import { db } from '@/lib/prisma';
import { getCmsPage, defaultContentForPage } from './schema';

export type ContentMap = Record<string, string>;

export async function getPageContent(pageSlug: string, preview = false): Promise<ContentMap> {
  const page = getCmsPage(pageSlug);
  const out: ContentMap = page ? defaultContentForPage(page) : {};

  try {
    const rows = await db.siteContent.findMany({ where: { page: pageSlug } });
    const stored = new Set<string>();
    for (const row of rows) {
      const key = `${row.section}.${row.field}`;
      const value = preview ? row.value : row.publishedValue;
      if (value !== null && value !== undefined) { out[key] = value; stored.add(key); }
    }
    for (const [key, legacy] of Object.entries(CMS_KEY_ALIASES[pageSlug] || {})) {
      if (!stored.has(key) && stored.has(legacy)) out[key] = out[legacy];
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
