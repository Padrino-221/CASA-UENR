import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleImage from '@/components/site/ArticleImage';
import { getPublishedArticles, getPublishedEvents } from '@/lib/cms/news';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'News & Events',
  description:
    'Upcoming events, announcements, recaps, and testimonies from the CASA UENR fellowship at the University of Energy and Natural Resources.',
  path: '/news',
});

export default async function NewsPage() {
  const [articles, events] = await Promise.all([getPublishedArticles(), getPublishedEvents()]);
  return (
    <div className="church-inner-page">
      <section className="church-page-intro"><div className="inner"><h1>News &amp; gatherings</h1><p>What is happening in the fellowship, and stories from our life together.</p></div></section>
      {events.length>0 && <section className="church-section" id="events"><div className="inner"><div className="church-section-heading"><h2>Fellowship calendar</h2><p>Contact the team to confirm details before attending a special event.</p></div><div className="church-event-list">{events.map((event,index)=><article key={index} className="church-event"><div className="church-event-date"><strong>{event.day}</strong><span>{event.month}</span></div><div><h3>{event.title}</h3><p>{event.text}</p><p className="church-event-details">{event.meta}</p></div></article>)}</div></div></section>}
      {articles.length>0 && <section className="church-section church-soft" id="latest"><div className="inner"><div className="church-section-heading"><h2>From the fellowship</h2></div><div className="church-news-grid">{articles.map(item=><Link href={`/news/${item.slug}`} key={item.slug} className="church-news-card">{item.image&&<div className="church-news-image"><ArticleImage src={item.image} alt={item.title} sizes="(max-width: 760px) 100vw, 33vw" /></div>}<div className="church-news-copy"><span>{item.kind}</span><h3>{item.title}</h3><p>{item.excerpt}</p><span className="church-read-link">Read more →</span></div></Link>)}</div></div></section>}
    </div>
  );
}
