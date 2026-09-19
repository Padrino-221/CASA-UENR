import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteArrow from '@/components/site/SiteArrow';
import { getArticleBySlug, getPublishedArticles } from '@/lib/cms/news';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Not found - CASA UENR' };
  return { title: `${article.title} - CASA UENR`, description: article.excerpt };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const all = await getPublishedArticles();
  const related = all.filter((item) => item.slug !== slug).slice(0, 2);

  return (
    <>
      {/* ============ Page Hero ============ */}
      <section className="page-hero">
        <div className="inner page-hero-inner">
          <div>
            <Link href="/news" className="section-link" style={{ marginBottom: 18 }}>
              &larr; Back to News &amp; Events
            </Link>
            <h1 data-reveal>{article.title}</h1>
          </div>
          <div className="lede" data-reveal data-reveal-delay="120">
            <p>{article.excerpt}</p>
          </div>
        </div>
      </section>

      {/* ============ Article body ============ */}
      <section className="about-section">
        <div className="inner">
          <div className="article-grid">
            <article className="article-body" data-reveal>
              <div className="event-top" style={{ marginBottom: 22 }}>
                <span className="event-kind">{article.kind}</span>
                <span className="event-meta" style={{ borderTop: 'none', paddingTop: 0 }}>
                  {article.meta}
                </span>
              </div>

              {article.image && (
                <div className="article-image">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 1080px) 100vw, 680px"
                  />
                </div>
              )}

              {article.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {article.quote && (
                <div className="article-quote">
                  <blockquote>&ldquo;{article.quote.text}&rdquo;</blockquote>
                  <cite>{article.quote.cite}</cite>
                </div>
              )}

              <div className="article-footer-note">
                <p>
                  Want to talk to someone about this?{' '}
                  <Link href="/contact" className="article-inline-link">
                    Reach out to us
                  </Link>{' '}
                  — or visit any gathering and ask for the welcome desk.
                </p>
              </div>
            </article>

            {/* Related sidebar */}
            <aside className="article-aside" data-reveal data-reveal-delay="120">
              <div className="badge">More from the house</div>
              <div className="article-aside-list">
                {related.map((item) => (
                  <Link key={item.slug} href={`/news/${item.slug}`} className="article-aside-card">
                    <span className="event-kind">{item.kind}</span>
                    <h4>{item.title}</h4>
                    <span className="event-meta" style={{ borderTop: 'none', paddingTop: 0 }}>
                      {item.meta}
                    </span>
                  </Link>
                ))}
                <Link href="/news" className="our-team-link">
                  All news &amp; events &rarr;
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ CTA Band ============ */}
      <section className="cta-band">
        <div className="inner cta-band-inner">
          <div data-reveal>
            <h2>
              Have a story or <span className="serif">testimony?</span>
            </h2>
            <p>We would love to hear what God has done — and share it to build the faith of the house.</p>
          </div>
          <Link href="/contact" className="btn btn-lime" data-reveal data-reveal-delay="120">
            Share your story
            <SiteArrow stroke="#0D47A1" />
          </Link>
        </div>
      </section>
    </>
  );
}
