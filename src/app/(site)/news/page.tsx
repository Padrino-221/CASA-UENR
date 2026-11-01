import { cmsPageMetadata } from '@/lib/cms/metadata';
import { cmsText, sectionVisible } from '@/lib/cms/display';
import Link from 'next/link';
import ArticleImage from '@/components/site/ArticleImage';
import { getPageContent } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';
import { getPublishedArticles, getPublishedEvents } from '@/lib/cms/news';

export async function generateMetadata({ searchParams }: { searchParams: SiteSearchParams }) { return cmsPageMetadata('news', await resolvePreview(searchParams)); }

export default async function NewsPage({searchParams}:{searchParams:SiteSearchParams}) {
  const c = await getPageContent('news', await resolvePreview(searchParams));
  const [articles, events] = await Promise.all([getPublishedArticles(), getPublishedEvents()]);
  return (
    <div className="church-inner-page">
      {sectionVisible(c,'hero')&&<section className="church-page-intro"><div className="inner"><h1>{cmsText(c['hero.heading'])}</h1><p>{c['hero.body']}</p></div></section>}
      {sectionVisible(c,'eventsHead')&&events.length>0 && <section className="church-section" id="events"><div className="inner"><div className="church-section-heading"><h2>{cmsText(c['eventsHead.heading'])}</h2><p>{c['eventsHead.subheading']}</p></div><div className="church-event-list">{events.map((event,index)=><article key={index} className="church-event"><div className="church-event-date"><strong>{event.day}</strong><span>{event.month}</span></div><div><h3>{event.title}</h3><p>{event.text}</p><p className="church-event-details">{event.meta}</p></div></article>)}</div></div></section>}
      {sectionVisible(c,'latestHead')&&articles.length>0 && <section className="church-section church-soft" id="latest"><div className="inner"><div className="church-section-heading"><h2>{cmsText(c['latestHead.heading'])}</h2>{c['latestHead.subheading']&&<p>{c['latestHead.subheading']}</p>}</div><div className="church-news-grid">{articles.map(item=><Link href={`/news/${item.slug}`} key={item.slug} className="church-news-card">{item.image&&<div className="church-news-image"><ArticleImage src={item.image} alt={item.title} sizes="(max-width: 760px) 100vw, 33vw" /></div>}<div className="church-news-copy"><span>{item.kind}</span><h3>{item.title}</h3><p>{item.excerpt}</p><span className="church-read-link">{c['latestHead.readLabel']} →</span></div></Link>)}</div></div></section>}
    </div>
  );
}
