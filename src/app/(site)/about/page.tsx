import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteArrow from '@/components/site/SiteArrow';
import RichHeading from '@/components/site/RichHeading';
import LeadersCarousel from '@/components/site/LeadersCarousel';
import { getPageContent, parseTags, parseParagraphs } from '@/lib/cms/content';
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

  const tags = parseTags(c['overview.tags']);
  const paragraphs = parseParagraphs(c['overview.body']);
  const leaders = await getPublishedLeaders();

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

      {/* ============ Subnav ============ */}
      <div className="subnav">
        <div className="inner subnav-inner">
          <a href="#overview" className="active">
            Overview
          </a>
          <a href="#leadership">Leadership</a>
        </div>
      </div>

      {/* ============ Overview ============ */}
      <section className="about-section" id="overview">
        <div className="inner">
          <div className="about-grid">
            <div className="about-left" data-reveal>
              <div className="badge">{c['overview.badge']}</div>
              <h2>
                <RichHeading text={c['overview.heading']} />
              </h2>
              <div className="about-image-wrapper">
                {c['overview.image'] && (
                  <Image
                    src={c['overview.image']}
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
                <RichHeading text={c['overview.heading2']} />
              </h3>
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              <div className="about-actions">
                <Link href={c['overview.ctaHref']} className="btn btn-ink">
                  {c['overview.ctaLabel']}
                  <SiteArrow stroke="#0D47A1" />
                </Link>
                <Link href="#leadership" className="our-team-link">
                  {c['overview.linkLabel']} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Scripture Strip ============ */}
      <div className="verse-strip" data-reveal>
        <div className="inner verse-inner">
          <blockquote>&ldquo;{c['verse.quoteText']}&rdquo;</blockquote>
          <cite>{c['verse.quoteCite']}</cite>
        </div>
      </div>

      {/* ============ Leadership ============ */}
      <section className="leadership-section" id="leadership">
        <div className="inner">
          <div className="section-head" data-reveal>
            <div>
              <div className="badge">{c['leadership.badge']}</div>
              <h2>
                <RichHeading text={c['leadership.heading']} />
              </h2>
            </div>
            <p>{c['leadership.subheading']}</p>
          </div>
          <LeadersCarousel leaders={leaders} />
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
