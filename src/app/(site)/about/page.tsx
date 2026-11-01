import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteArrow from '@/components/site/SiteArrow';
import LeadersCarousel from '@/components/site/LeadersCarousel';
import { getPageContent, parseParagraphs } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';
import { getPublishedLeaders } from '@/lib/cms/leaders';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description:
    'Who we are, what we believe, and the leaders serving the CASA UENR fellowship at the University of Energy and Natural Resources (UENR), Sunyani.',
  path: '/about',
});

export default async function AboutPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('about', preview);

  const paragraphs = parseParagraphs(c['overview.body']);
  const leaders = await getPublishedLeaders();

  return (
    <div className="church-inner-page">
      <section className="church-page-intro"><div className="inner"><h1>About CASA UENR</h1><p>A Christian community for university life, built around worship, friendship, and service.</p></div></section>
      <section className="church-section"><div className="inner church-story">
        <div className="church-story-image">{c['overview.image'] && <Image src={c['overview.image']} alt="Members of the CASA UENR fellowship" fill sizes="(max-width: 760px) 100vw, 50vw" />}</div>
        <div><h2>A place to grow in faith</h2>{paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}<Link href="/contact" className="btn btn-ink">Visit the fellowship<SiteArrow stroke="currentColor" /></Link></div>
      </div></section>
      <section className="church-section church-soft"><div className="inner"><div className="church-section-heading"><h2>Faith lived out on campus</h2><p>Our life together continues beyond the Sunday gathering.</p></div><div className="church-three-columns"><div><h3>Learn together</h3><p>Explore the Bible, ask questions, and build a faith that shapes your everyday decisions.</p></div><div><h3>Care for one another</h3><p>Find friendship, encouragement, and prayer through the demands of university life.</p></div><div><h3>Serve with purpose</h3><p>Use your gifts to support the fellowship and share the love of Christ on campus.</p></div></div></div></section>
      {leaders.length>0 && <section className="church-section" id="leadership"><div className="inner"><div className="church-section-heading"><h2>Meet the leadership</h2><p>The students and associates serving our fellowship.</p></div><LeadersCarousel leaders={leaders} /></div></section>}
    </div>
  );
}
