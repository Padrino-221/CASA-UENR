import { db } from '@/lib/prisma';

export interface CmsArticle {
  slug: string;
  kind: string;
  title: string;
  excerpt: string;
  body: string[];
  quote?: { text: string; cite: string };
  image?: string;
  meta: string;
  date?: string;
}

export interface CmsEvent {
  month: string;
  day: string;
  kind: string;
  title: string;
  text: string;
  meta: string;
}

type ArticleRow = {
  slug: string;
  kind: string;
  title: string;
  excerpt: string;
  body: string;
  quoteText: string | null;
  quoteCite: string | null;
  imageUrl: string | null;
  meta: string | null;
  createdAt?: Date | string;
};

function mapArticle(row: ArticleRow): CmsArticle {
  let body: string[] = [];
  try {
    const parsed = JSON.parse(row.body || '[]');
    if (Array.isArray(parsed)) body = parsed.map((p) => String(p));
  } catch {
    body = [];
  }
  return {
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    excerpt: row.excerpt,
    body,
    quote: row.quoteText ? { text: row.quoteText, cite: row.quoteCite || '' } : undefined,
    image: row.imageUrl || undefined,
    meta: row.meta || '',
    date: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
  };
}

export async function getPublishedArticles(): Promise<CmsArticle[]> {
  try {
    const rows = (await db.siteArticle.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })) as ArticleRow[];
    return rows.map(mapArticle);
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<CmsArticle | undefined> {
  try {
    const row = (await db.siteArticle.findUnique({ where: { slug } })) as ArticleRow & { published: boolean } | null;
    return row?.published ? mapArticle(row) : undefined;
  } catch {
    /* fall through to static */
  }
  return undefined;
}

export async function getPublishedEvents(): Promise<CmsEvent[]> {
  try {
    const rows = (await db.siteEvent.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })) as CmsEvent[];
    return rows.map((r) => ({ month: r.month, day: r.day, kind: r.kind, title: r.title, text: r.text, meta: r.meta || '' }));
  } catch {
    return [];
  }
}
