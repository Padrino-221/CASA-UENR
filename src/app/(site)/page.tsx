import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, CalendarBlank, UsersThree, HandsPraying } from '@phosphor-icons/react/dist/ssr';
import { SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from '@/lib/seo';
import { getPageContent, parseList } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';

const HOME_TITLE = `${SITE_NAME} — Christ Apostolic Students and Associates at UENR`;

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} logo` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function HomePage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('home', preview);
  const gatherings = parseList<{ name: string; time: string }>(c['heroImage.gatherings']);
  const steps = parseList<{ title: string; text: string; href: string; label: string }>(c['welcome.steps']);
  const icons = [CalendarBlank, UsersThree, HandsPraying];
  return <>
    <section className="church-welcome">
      <div className="inner welcome-layout">
        <div className="welcome-copy">
          <span className="section-label">Welcome to CASA UENR</span>
          <h1>{c['welcome.heading']}</h1>
          <p>{c['welcome.body']}</p>
          <div className="welcome-actions"><Link href="/contact" className="btn btn-ink">{c['welcome.ctaLabel']}<ArrowRight size={20}/></Link><Link href="/about" className="text-link">Get to know us</Link></div>
        </div>
        <div className="welcome-image">{c['heroImage.image'] && <Image src={c['heroImage.image']} alt="Students worshipping together at CASA UENR" fill sizes="(max-width: 800px) 100vw, 50vw" priority />}</div>
      </div>
    </section>
    <section className="church-gatherings" aria-labelledby="gatherings-heading"><div className="inner">
      <div className="gatherings-intro"><h2 id="gatherings-heading">Join us this week</h2><p><MapPin size={17} aria-hidden="true"/>{c['heroImage.venue']}</p></div>
      <div className="gatherings-list">{gatherings.map(item=><div className="gathering-item" key={item.name}><h3>{item.name}</h3><p>{item.time}</p></div>)}</div>
    </div></section>
    <section className="church-community"><div className="inner community-layout">
      <div className="community-image">{c['aboutTeaser.image'] && <Image src={c['aboutTeaser.image']} alt="Students sharing fellowship on campus" fill sizes="(max-width:800px) 100vw, 45vw" />}</div>
      <div className="community-copy"><span className="section-label">Life together, in Christ</span><h2>{c['welcome.communityHeading']}</h2><p>{c['welcome.communityBody']}</p><Link href="/about" className="text-link">More about our fellowship <ArrowRight size={18}/></Link></div>
    </div></section>
    <section className="church-next"><div className="inner"><div className="section-intro"><h2>{c['welcome.nextHeading']}</h2><p>{c['welcome.nextBody']}</p></div><div className="next-grid">{steps.map((step,index)=>{const Icon=icons[index%icons.length];return <article className="next-card" key={step.title}><Icon size={28} aria-hidden="true"/><h3>{step.title}</h3><p>{step.text}</p><Link href={step.href} className="text-link">{step.label}<ArrowRight size={18}/></Link></article>;})}</div></div></section>
  </>;
}
