import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getContentSession } from '@/lib/cms/auth';
import { getCmsPage } from '@/lib/cms/schema';
import { getPageContent } from '@/lib/cms/content';
import ContentEditor from '@/components/cms/ContentEditor';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

export default async function ContentPageEditor({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const session = await getContentSession();
  if (!session) redirect('/login');

  const { page: slug } = await params;
  const page = getCmsPage(slug);
  if (!page) notFound();

  const content = await getPageContent(slug, true);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8] hover:text-primary"
        >
          <ArrowLeft size={13} weight="bold" />
          All pages
        </Link>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mt-3">{page.title}</h1>
        {page.description && (
          <p className="text-sm text-[#64748B] font-medium mt-2 max-w-2xl">{page.description}</p>
        )}
      </header>

      <ContentEditor page={page} initialContent={content} />
    </div>
  );
}
