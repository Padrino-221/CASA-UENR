import { cmsPageMetadata } from '@/lib/cms/metadata';
import { cmsText, safeHref, sectionVisible } from '@/lib/cms/display';
import Link from 'next/link';
import SiteArrow from '@/components/site/SiteArrow';
import {
  MusicNotes,
  HandsPraying,
  Lightning,
  Article,
  Heart,
  HandWaving,
} from '@phosphor-icons/react/dist/ssr';
import { getPageContent, parseList } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';

export async function generateMetadata({ searchParams }: { searchParams: SiteSearchParams }) { return cmsPageMetadata('departments', await resolvePreview(searchParams)); }

const ICONS: Record<string, typeof MusicNotes> = {
  MusicNotes,
  HandsPraying,
  Lightning,
  Article,
  Heart,
  HandWaving,
};

export default async function DepartmentsPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('departments', preview);

  const departments = parseList<{ name: string; text: string; linkLabel: string; icon: string }>(c['grid.items']);
  const steps = parseList<{ number: string; title: string; text: string }>(c['steps.items']);

  return <div className="church-inner-page">
    {sectionVisible(c,'hero')&&<section className="church-page-intro"><div className="inner"><h1>{cmsText(c['hero.heading'])}</h1><p>{c['hero.body']}</p></div></section>}
    {sectionVisible(c,'grid')&&<section className="church-section"><div className="inner"><div className="church-department-grid">{departments.map((dept,index)=>{const Icon=ICONS[dept.icon]??MusicNotes;return <article className="church-department" key={index}><Icon size={28} aria-hidden="true"/><div><h2>{dept.name}</h2><p>{dept.text}</p></div></article>;})}</div></div></section>}
    {sectionVisible(c,'steps')&&<section className="church-section church-soft" id="join"><div className="inner church-join-layout"><div><h2>{cmsText(c['steps.heading'])}</h2><p>{c['steps.subheading']}</p>{c['steps.ctaLabel']&&<Link href={safeHref(c['steps.ctaHref'])} className="btn btn-ink">{c['steps.ctaLabel']}<SiteArrow stroke="currentColor"/></Link>}</div><ol className="church-steps">{steps.map((step,index)=><li key={index}><span>{step.number||index+1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></div></section>}
  </div>;
}
