import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getContentSession } from '@/lib/cms/auth';
import { CMS_PAGES } from '@/lib/cms/schema';
import { FileText, Newspaper, CalendarBlank, Images, ArrowRight, UsersThree } from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

const PAGE_ICONS: Record<string, typeof FileText> = {
  global: FileText,
  home: FileText,
  about: FileText,
  departments: FileText,
  contact: FileText,
  news: Newspaper,
};

export default async function ContentDashboardPage() {
  const session = await getContentSession();
  if (!session) redirect('/login');

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Website CMS</p>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mt-1">Manage the website</h1>
        <p className="text-sm text-[#64748B] font-medium mt-2 max-w-2xl">
          Select a page to edit its sections. Changes are saved as drafts first — preview them,
          then publish to make them live.
        </p>
      </header>

      <section>
        <h2 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#94A3B8] mb-3">Pages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CMS_PAGES.map((page) => {
            const Icon = PAGE_ICONS[page.slug] ?? FileText;
            return (
              <Link
                key={page.slug}
                href={`/content/${page.slug}`}
                className="group border border-[#E2E8F0] bg-white p-5 hover:border-primary transition-colors flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-[#EFF6FF] text-primary flex items-center justify-center">
                    <Icon size={20} weight="duotone" />
                  </div>
                  <ArrowRight size={16} weight="bold" className="text-[#CBD5E1] group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-4">
                  <h3 className="text-[16px] font-black text-[#0F172A] tracking-tight">{page.title}</h3>
                  <p className="text-[12px] text-[#64748B] font-medium mt-1">
                    {page.sections.length} section{page.sections.length === 1 ? '' : 's'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#94A3B8] mb-3">Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/content/leaders', label: 'Leaders', desc: 'Leadership carousel', Icon: UsersThree },
            { href: '/content/news', label: 'News & Articles', desc: 'Write and publish articles', Icon: Newspaper },
            { href: '/content/events', label: 'Upcoming Events', desc: 'Manage the event calendar', Icon: CalendarBlank },
            { href: '/content/media', label: 'Media Library', desc: 'Uploaded images', Icon: Images },
          ].map(({ href, label, desc, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group border border-[#E2E8F0] bg-white p-5 hover:border-primary transition-colors flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-[#EFF6FF] text-primary flex items-center justify-center shrink-0">
                <Icon size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight">{label}</h3>
                <p className="text-[12px] text-[#64748B] font-medium mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
