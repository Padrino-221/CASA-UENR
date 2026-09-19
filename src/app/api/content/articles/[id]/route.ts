import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { createAuditLog } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const data = await request.json();
    const title = String(data.title || '').trim();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const body = Array.isArray(data.body) ? data.body : [];

    const article = await db.siteArticle.update({
      where: { id },
      data: {
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
      action: 'UPDATE',
      entity: 'SITE_ARTICLE',
      entityId: article.id,
      metadata: { title: article.title },
    });

    return NextResponse.json(article);
  } catch (err) {
    console.error('Article update error:', err);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await db.siteArticle.delete({ where: { id } });
    await createAuditLog({
      userId: session.user.id as string,
      action: 'DELETE',
      entity: 'SITE_ARTICLE',
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Article delete error:', err);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
