import { cmsPageMetadata } from '@/lib/cms/metadata';
import { cmsText, safeHref, sectionVisible } from '@/lib/cms/display';
import Link from 'next/link';
import ArticleImage from '@/components/site/ArticleImage';
import SiteArrow from '@/components/site/SiteArrow';
import LeadersCarousel from '@/components/site/LeadersCarousel';
import { getPageContent, parseParagraphs, parseList } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';
import { getPublishedLeaders } from '@/lib/cms/leaders';

export async function generateMetadata({ searchParams }: { searchParams: SiteSearchParams }) { return cmsPageMetadata('about', await resolvePreview(searchParams)); }

export default async function AboutPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('about', preview);

  const paragraphs = parseParagraphs(c['overview.body']);
  const leaders = await getPublishedLeaders();
  const values = parseList<{title:string;text:string}>(c['campus.items']);

  return <div className="church-inner-page">
    {sectionVisible(c,'hero')&&<section className="church-page-intro"><div className="inner"><h1>{cmsText(c['hero.heading'])}</h1><p>{c['hero.body']}</p></div></section>}
    {sectionVisible(c,'overview')&&<section className="church-section"><div className="inner church-story"><div className="church-story-image">{c['overview.image']&&<ArticleImage src={c['overview.image']} alt={c['overview.imageAlt']} sizes="(max-width:760px) 100vw, 50vw"/>}</div><div><h2>{cmsText(c['overview.heading'])}</h2>{paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}{c['overview.ctaLabel']&&<Link href={safeHref(c['overview.ctaHref'])} className="btn btn-ink">{c['overview.ctaLabel']}<SiteArrow stroke="currentColor"/></Link>}</div></div></section>}
    {sectionVisible(c,'campus')&&<section className="church-section church-soft"><div className="inner"><div className="church-section-heading"><h2>{cmsText(c['campus.heading'])}</h2><p>{c['campus.body']}</p></div><div className="church-three-columns">{values.map((value,index)=><div key={index}><h3>{value.title}</h3><p>{value.text}</p></div>)}</div></div></section>}
    {sectionVisible(c,'leadership')&&leaders.length>0&&<section className="church-section" id="leadership"><div className="inner"><div className="church-section-heading"><h2>{cmsText(c['leadership.heading'])}</h2><p>{c['leadership.subheading']}</p></div><LeadersCarousel leaders={leaders} labels={{label:c['leadership.label'],countLabel:c['leadership.countLabel'],swipeLabel:c['leadership.swipeLabel']}}/></div></section>}
  </div>;
}
