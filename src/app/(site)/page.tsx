import { cmsPageMetadata } from '@/lib/cms/metadata';
import { cmsText, safeHref, sectionVisible } from '@/lib/cms/display';
import Link from 'next/link';
import ArticleImage from '@/components/site/ArticleImage';
import HeroCarousel from '@/components/site/HeroCarousel';
import { ArrowRight, MapPin, CalendarBlank, UsersThree, HandsPraying } from '@phosphor-icons/react/dist/ssr';
import { getPageContent, parseList } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';

export async function generateMetadata({ searchParams }: { searchParams: SiteSearchParams }) { return cmsPageMetadata('home', await resolvePreview(searchParams)); }

export default async function HomePage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('home', preview);
  const heroSlides = [
    ...(c['welcome.image'] ? [{ image: c['welcome.image'], alt: c['welcome.imageAlt'] }] : []),
    ...parseList<{ image: string; alt: string }>(c['welcome.slides']).filter(slide => slide.image),
  ];
  const gatherings = parseList<{ name: string; time: string }>(c['heroImage.gatherings']);
  const steps = parseList<{ title: string; text: string; href: string; label: string }>(c['next.items']);
  const icons = [CalendarBlank, UsersThree, HandsPraying];
  return <>
    {sectionVisible(c,'welcome')&&<section className="church-welcome">
      <div className="inner welcome-layout"><div className="welcome-copy">
        <span className="section-label">{c['welcome.eyebrow']}</span><h1>{cmsText(c['welcome.heading'])}</h1><p>{c['welcome.body']}</p>
        <div className="welcome-actions">{c['welcome.ctaLabel']&&<Link href={safeHref(c['welcome.ctaHref'])} className="btn btn-ink">{c['welcome.ctaLabel']}<ArrowRight size={20}/></Link>}{c['welcome.secondaryLabel']&&<Link href={safeHref(c['welcome.secondaryHref'])} className="text-link">{c['welcome.secondaryLabel']}</Link>}</div>
      </div><div className="welcome-image"><HeroCarousel slides={heroSlides}/></div></div>
    </section>}
    {sectionVisible(c,'heroImage')&&<section className="church-gatherings" aria-labelledby="gatherings-heading"><div className="inner"><div className="gatherings-intro"><h2 id="gatherings-heading">{cmsText(c['heroImage.heading'])}</h2><p><MapPin size={17} aria-hidden="true"/>{c['heroImage.venue']}</p></div><div className="gatherings-list">{gatherings.map((item,index)=><div className="gathering-item" key={index}><h3>{item.name}</h3><p>{item.time}</p></div>)}</div></div></section>}
    {sectionVisible(c,'community')&&<section className="church-community"><div className="inner community-layout"><div className="community-image">{c['community.image']&&<ArticleImage src={c['community.image']} alt={c['community.imageAlt']} sizes="(max-width:800px) 100vw, 45vw"/>}</div><div className="community-copy"><span className="section-label">{c['community.eyebrow']}</span><h2>{cmsText(c['community.heading'])}</h2><p>{c['community.body']}</p>{c['community.ctaLabel']&&<Link href={safeHref(c['community.ctaHref'])} className="text-link">{c['community.ctaLabel']} <ArrowRight size={18}/></Link>}</div></div></section>}
    {sectionVisible(c,'next')&&<section className="church-next"><div className="inner"><div className="section-intro"><h2>{cmsText(c['next.heading'])}</h2><p>{c['next.body']}</p></div><div className="next-grid">{steps.map((step,index)=>{const Icon=icons[index%icons.length];return <article className="next-card" key={index}><Icon size={28} aria-hidden="true"/><h3>{step.title}</h3><p>{step.text}</p>{step.label&&<Link href={safeHref(step.href)} className="text-link">{step.label}<ArrowRight size={18}/></Link>}</article>;})}</div></div></section>}
  </>;
}
