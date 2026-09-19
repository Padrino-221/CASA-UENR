import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { createAuditLog } from '@/lib/audit';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function GET() {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const articles = await db.siteArticle.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const title = String(data.title || '').trim();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const baseSlug = data.slug ? slugify(String(data.slug)) : slugify(title);
    let slug = baseSlug || `article-${Date.now()}`;
    let suffix = 1;
    while (await db.siteArticle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const body = Array.isArray(data.body) ? data.body : [];

    const article = await db.siteArticle.create({
      data: {
        slug,
        kind: String(data.kind || 'Recap'),
        title,
        excerpt: String(data.excerpt || ''),
        body: JSON.stringify(body),
        quoteText: data.quoteText ? String(data.quoteText) : null,
        quoteCite: data.quoteCite ? String(data.quoteCite) : null,
        imageUrl: data.imageUrl ? String(data.imageUrl) : null,
        meta: data.meta ? String(data.meta) : null,
        published: Boolean(data.published),
        order: Number(data.order) || 0,
      },
    });

    await createAuditLog({
      userId: session.user.id as string,
      action: 'CREATE',
      entity: 'SITE_ARTICLE',
      entityId: article.id,
      metadata: { title: article.title, slug: article.slug },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error('Article create error:', err);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
