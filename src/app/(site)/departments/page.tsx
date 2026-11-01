import type { Metadata } from 'next';
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
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Departments',
  description:
    'Find your place in one of the six CASA UENR departments — Choir & Music, Prayer Force, Evangelism, Media & Tech, Welfare, and Ushering & Protocol.',
  path: '/departments',
});

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

  return (
    <div className="church-inner-page">
      <section className="church-page-intro"><div className="inner"><h1>Find a place to serve</h1><p>Bring your interests, learn something new, and help make fellowship life possible.</p></div></section>
      <section className="church-section"><div className="inner"><div className="church-department-grid">{departments.map(dept=>{const Icon=ICONS[dept.icon]??MusicNotes;return <article className="church-department" key={dept.name}><Icon size={28} aria-hidden="true"/><div><h2>{dept.name}</h2><p>{dept.text}</p></div></article>;})}</div></div></section>
      <section className="church-section church-soft" id="join"><div className="inner church-join-layout"><div><h2>Getting involved is simple</h2><p>You do not need to have everything figured out. Come to a gathering, meet the team, and find where you feel at home.</p><Link href="/contact" className="btn btn-ink">Talk to the team<SiteArrow stroke="currentColor" /></Link></div><ol className="church-steps">{steps.map((step,index)=><li key={index}><span>{index+1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></div></section>
    </div>
  );
}
