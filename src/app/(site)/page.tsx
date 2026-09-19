import Link from 'next/link';
import Image from 'next/image';
import SiteArrow from '@/components/site/SiteArrow';
import RichHeading from '@/components/site/RichHeading';
import {
  MusicNotes,
  HandsPraying,
  Lightning,
  Article,
  Heart,
  HandWaving,
} from '@phosphor-icons/react/dist/ssr';
import { getPageContent, parseList, parseTags } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';

const ICONS: Record<string, typeof MusicNotes> = {
  MusicNotes,
  HandsPraying,
  Lightning,
  Article,
  Heart,
  HandWaving,
};

export default async function HomePage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const c = await getPageContent('home', preview);

  const gatherings = parseList<{ name: string; time: string }>(c['heroImage.gatherings']);
  const deptItems = parseList<{ name: string; text: string; linkLabel: string; icon: string }>(
    c['departmentsTeaser.items']
  );
  const eventItems = parseList<{ month: string; day: string; kind: string; title: string; text: string; meta: string }>(
    c['newsTeaser.items']
  );
  const tags = parseTags(c['aboutTeaser.tags']);

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="hero" id="home">
        <div className="inner">
          <div className="hero-content">
            <div className="hero-text" data-reveal>
              <h1>
                <RichHeading text={c['hero.heading']} />
              </h1>
            </div>
            <div className="hero-right" data-reveal data-reveal-delay="120">
              <p>{c['hero.body']}</p>
              <Link href={c['hero.ctaHref']} className="btn btn-white">
                {c['hero.ctaLabel']}
                <SiteArrow stroke="#fff" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="hero-image-wrapper" data-reveal data-reveal-delay="150">
        {c['heroImage.image'] && (
          <Image
            src={c['heroImage.image']}
            alt="Students worshipping together"
            fill
            sizes="100vw"
            className="hero-image"
            priority
          />
        )}
        <div className="gatherings-card">
          <div className="label">Weekly gatherings</div>
          {gatherings.map((item, index) => (
            <div className="gathering-row" key={index}>
              <span className="name">{item.name}</span>
              <span className="time">{item.time}</span>
            </div>
          ))}
          <div className="venue">{c['heroImage.venue']}</div>
        </div>
      </div>

      {/* ============ Scripture Strip ============ */}
      <div className="verse-strip" data-reveal>
        <div className="inner verse-inner">
          <blockquote>&ldquo;{c['verse.quoteText']}&rdquo;</blockquote>
          <cite>{c['verse.quoteCite']}</cite>
        </div>
      </div>

      {/* ============ About teaser ============ */}
      <section className="about-section" id="about">
        <div className="inner">
          <div className="about-grid">
            <div className="about-left" data-reveal>
              <div className="badge">{c['aboutTeaser.badge']}</div>
              <h2>
                <RichHeading text={c['aboutTeaser.heading']} />
              </h2>
              <div className="about-image-wrapper">
                {c['aboutTeaser.image'] && (
                  <Image
                    src={c['aboutTeaser.image']}
                    alt="Students walking together on campus"
                    fill
                    sizes="(max-width: 1080px) 100vw, 560px"
                    className="about-image"
                  />
                )}
                <div className="about-tags">
                  {tags.map((tag, index) => (
                    <span className={`about-tag${index === 0 ? ' green' : ''}`} key={index}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="about-right" data-reveal data-reveal-delay="120">
              <h3>
                <RichHeading text={c['aboutTeaser.heading2']} />
              </h3>
              <p>{c['aboutTeaser.body']}</p>
              <div className="about-actions">
                <Link href={c['aboutTeaser.ctaHref']} className="btn btn-ink">
                  {c['aboutTeaser.ctaLabel']}
                  <SiteArrow stroke="#0D47A1" />
                </Link>
                <Link href="/about#leadership" className="our-team-link">
                  {c['aboutTeaser.linkLabel']} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Departments teaser ============ */}
      <section className="departments-section" id="departments">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['departmentsTeaser.badge']}</div>
              <h2>
                <RichHeading text={c['departmentsTeaser.heading']} />
              </h2>
            </div>
            <Link href="/departments" className="section-link">
              {c['departmentsTeaser.linkLabel']} &rarr;
            </Link>
          </div>
          <div className="departments-grid">
            {deptItems.map((dept, index) => {
              const Icon = ICONS[dept.icon] ?? MusicNotes;
              return (
                <div className="dept-card" data-reveal data-reveal-delay={index * 80} key={index}>
                  <div className="dept-symbol">
                    <Icon size={20} weight="fill" />
                  </div>
                  <div>
                    <h3>{dept.name}</h3>
                    <p>{dept.text}</p>
                  </div>
                  <Link href="/departments" className="join-link">
                    {dept.linkLabel} &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ News teaser ============ */}
      <section className="news-section" id="news">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['newsTeaser.badge']}</div>
              <h2>
                <RichHeading text={c['newsTeaser.heading']} />
              </h2>
            </div>
            <Link href="/news" className="section-link">
              {c['newsTeaser.linkLabel']} &rarr;
            </Link>
          </div>
          <div className="news-grid">
            {eventItems.map((event, index) => (
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
