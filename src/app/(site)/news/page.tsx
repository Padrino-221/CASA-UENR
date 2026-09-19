import Link from 'next/link';
import Image from 'next/image';
import SiteArrow from '@/components/site/SiteArrow';
import RichHeading from '@/components/site/RichHeading';
import { getPageContent } from '@/lib/cms/content';
import { getPublishedArticles, getPublishedEvents } from '@/lib/cms/news';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';

const ANNOUNCEMENT_LINKS: Record<string, { href: string; label: string; cls: string; stroke: string }> = {
  'freshers-registration-is-open': {
    href: '/about#leadership',
    label: 'Meet the executives',
    cls: 'btn-ink',
    stroke: '#0D47A1',
  },
  'departmental-meetings-resume': {
    href: '/departments',
    label: 'View departments',
    cls: 'btn-white',
    stroke: '#fff',
  },
};

export default async function NewsPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('news', preview);
  const articles = await getPublishedArticles();
  const events = await getPublishedEvents();

  const announcements = articles.filter((a) => a.kind === 'Announcement');
  const news = articles.filter((a) => a.kind !== 'Announcement');

  return (
    <>
      {/* ============ Page Hero ============ */}
      <section className="page-hero">
        <div className="inner page-hero-inner">
          <h1 data-reveal>
            <RichHeading text={c['hero.heading']} />
          </h1>
          <div className="lede" data-reveal data-reveal-delay="120">
            <p>{c['hero.body']}</p>
          </div>
        </div>
      </section>

      {/* ============ Upcoming Events ============ */}
      <section className="news-section on-white" id="events">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['eventsHead.badge']}</div>
              <h2>
                <RichHeading text={c['eventsHead.heading']} />
              </h2>
            </div>
            <p>{c['eventsHead.subheading']}</p>
          </div>
          <div className="news-grid">
            {events.map((event, index) => (
              <div className="event-card" data-reveal data-reveal-delay={index * 100} key={index}>
                <div className="event-top">
                  <div className="date-block">
                    <span className="month">{event.month}</span>
                    <span className="day">{event.day}</span>
                  </div>
                  <span className="event-kind">{event.kind}</span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.text}</p>
                <div className="event-meta">{event.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Announcements ============ */}
      <section className="steps-section" id="announcements">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['announcementsHead.badge']}</div>
              <h2>
                <RichHeading text={c['announcementsHead.heading']} />
              </h2>
            </div>
            <p>{c['announcementsHead.subheading']}</p>
          </div>
          <div className="announcements-grid">
            {announcements.map((item, index) => {
              const link = ANNOUNCEMENT_LINKS[item.slug];
              return (
                <div
                  key={item.slug}
                  className={`announcement-card${index % 2 === 1 ? ' neutral' : ''}`}
                  data-reveal
                  data-reveal-delay={index * 120}
                >
                  <h3>
                    <Link href={`/news/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p>{item.excerpt}</p>
                  {link ? (
                    <Link href={link.href} className={`btn ${link.cls}`}>
                      {link.label}
                      <SiteArrow stroke={link.stroke} />
                    </Link>
                  ) : (
                    <Link href={`/news/${item.slug}`} className="our-team-link">
                      Read the full notice &rarr;
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Latest News ============ */}
      <section className="about-section" id="latest">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['latestHead.badge']}</div>
              <h2>
                <RichHeading text={c['latestHead.heading']} />
              </h2>
            </div>
            <p>{c['latestHead.subheading']}</p>
          </div>
          <div className="news-list">
            {news.map((item, index) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="news-item"
                data-reveal
                data-reveal-delay={index * 120}
              >
                <div className="news-item-image">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1080px) 100vw, 420px"
                      className="news-item-img"
                    />
                  )}
                  <span className="event-kind">{item.kind}</span>
                </div>
                <div className="news-item-body">
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <div className="event-meta">{item.meta}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA Band ============ */}
      <section className="cta-band">
        <div className="inner cta-band-inner">
          <div data-reveal>
            <h2>
              <RichHeading text={c['cta.heading']} />
            </h2>
            <p>{c['cta.body']}</p>
          </div>
          <Link href={c['cta.ctaHref']} className="btn btn-lime" data-reveal data-reveal-delay="120">
            {c['cta.ctaLabel']}
            <SiteArrow stroke="#0D47A1" />
          </Link>
        </div>
      </section>
    </>
  );
}
