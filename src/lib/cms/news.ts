import { db } from '@/lib/prisma';
import { SITE_ARTICLES, getArticleBySlug as getStaticArticle } from '@/lib/site-news';

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

const STATIC_EVENTS: CmsEvent[] = [
  { month: 'Sep', day: '26', kind: 'Outreach', title: 'Campus Evangelism Drive', text: 'Teams head out across hostels and faculties to share the good news and pray with students.', meta: 'Meet at Chapel Annex · 4:00 PM' },
  { month: 'Oct', day: '02', kind: 'Fellowship', title: "Freshers' Welcome Night", text: 'Worship, testimonies, and dinner to welcome the new intake into the CASA family.', meta: 'Main Auditorium · 6:00 PM' },
  { month: 'Oct', day: '16', kind: 'Retreat', title: 'Annual Campus Retreat', text: 'Three days away with God — teachings, workshops, and communion at the mountain.', meta: 'C.A.C. Camp Ground · Oct 16–18' },
];

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
    if (rows.length === 0) return SITE_ARTICLES;
    return rows.map(mapArticle);
  } catch {
    return SITE_ARTICLES;
  }
}

export async function getArticleBySlug(slug: string): Promise<CmsArticle | undefined> {
  try {
    const row = (await db.siteArticle.findUnique({ where: { slug } })) as ArticleRow & { published: boolean } | null;
    if (row && row.published) return mapArticle(row);
  } catch {
    /* fall through to static */
  }
  return getStaticArticle(slug);
}

export async function getPublishedEvents(): Promise<CmsEvent[]> {
  try {
    const rows = (await db.siteEvent.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })) as CmsEvent[];
    if (rows.length === 0) return STATIC_EVENTS;
    return rows.map((r) => ({ month: r.month, day: r.day, kind: r.kind, title: r.title, text: r.text, meta: r.meta || '' }));
  } catch {
    return STATIC_EVENTS;
  }
}
