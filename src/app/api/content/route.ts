import { CMS_KEY_ALIASES } from '@/lib/cms/aliases';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { getCmsPage } from '@/lib/cms/schema';
import { getPageContent } from '@/lib/cms/content';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  if (!page || !getCmsPage(page)) {
    return NextResponse.json({ error: 'Unknown page' }, { status: 400 });
  }

  const content = await getPageContent(page, true);
  return NextResponse.json({ page, content });
}

export async function POST(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { page, action = 'save', values = {}, section } = body as {
      page?: string;
      action?: 'save' | 'publish' | 'reset';
      values?: Record<string, string>;
      section?: string;
    };

    if (!['save','publish','reset'].includes(action)) return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    const cmsPage = page ? getCmsPage(page) : undefined;
    if (!page || !cmsPage) {
      return NextResponse.json({ error: 'Unknown page' }, { status: 400 });
    }

    if (action === 'reset') {
      const legacyFields = Object.entries(CMS_KEY_ALIASES[page] || {}).filter(([key]) => key.startsWith(`${section}.`)).map(([, legacy]) => { const [section, field] = legacy.split('.'); return { section, field }; });
      await db.siteContent.deleteMany({ where: section ? { page, OR: [{ section }, ...legacyFields] } : { page } });
      await createAuditLog({
        userId: session.user.id as string,
        action: 'DELETE',
        entity: 'SITE_CONTENT',
        entityId: `${page}${section ? `.${section}` : ''}`,
        metadata: { page, section },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, content: await getPageContent(page, true) });
    }

    const validFields = new Set<string>();
    for (const s of cmsPage.sections) {
      for (const f of s.fields) validFields.add(`${s.key}.${f.key}`);
    }

    const entries = Object.entries(values).filter(([key]) => validFields.has(key));
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No valid fields supplied' }, { status: 400 });
    }

    const publish = action === 'publish';

    await db.$transaction(async (tx) => {
      for (const [key, rawValue] of entries) {
        const [sec, field] = key.split('.');
        const value = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
        await tx.siteContent.upsert({
          where: { page_section_field: { page, section: sec, field } },
          create: { page, section: sec, field, value, publishedValue: publish ? value : null },
          update: { value, ...(publish ? { publishedValue: value } : {}) },
        });
      }
    });

    await createAuditLog({
      userId: session.user.id as string,
      action: publish ? 'UPDATE' : 'CREATE',
      entity: 'SITE_CONTENT',
      entityId: page,
      metadata: { page, published: publish, fields: entries.length },
    });

    if (publish) revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, content: await getPageContent(page, true) });
  } catch (err) {
    console.error('Content save error:', err);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
