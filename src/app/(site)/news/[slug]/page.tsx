import Link from 'next/link';
import ArticleImage from '@/components/site/ArticleImage';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getPublishedArticles } from '@/lib/cms/news';
import { SITE_NAME, SITE_URL, OG_IMAGE } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article not found' };

  const url = `/news/${article.slug}`;
  const images = article.image
    ? [{ url: article.image, width: 1200, height: 630, alt: article.title }]
    : [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      images,
      publishedTime: article.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: images.map((image) => image.url),
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const all = await getPublishedArticles();
  const related = all.filter((item) => item.slug !== slug).slice(0, 2);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.image ? [article.image] : [`${SITE_URL}${OG_IMAGE}`],
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/casa-logo-white.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/news/${article.slug}` },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'News & Events', item: `${SITE_URL}/news` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/news/${article.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="church-inner-page"><section className="church-section"><div className="inner church-article">
        <Link href="/news" className="church-back-link">← All news &amp; gatherings</Link>
        <header><span className="church-article-kind">{article.kind}</span><h1>{article.title}</h1><p className="church-article-summary">{article.excerpt}</p>{article.meta&&<p className="church-article-meta">{article.meta}</p>}</header>
        {article.image&&<div className="church-article-image"><ArticleImage src={article.image} alt={article.title} sizes="(max-width: 900px) 100vw, 840px" priority /></div>}
        <article className="church-article-body">{article.body.map((paragraph,index)=><p key={index}>{paragraph}</p>)}{article.quote&&<blockquote><p>{article.quote.text}</p><cite>{article.quote.cite}</cite></blockquote>}</article>
      </div></section>
      {related.length>0&&<section className="church-section church-soft"><div className="inner"><h2>More from the fellowship</h2><div className="church-related">{related.map(item=><Link key={item.slug} href={`/news/${item.slug}`}><h3>{item.title}</h3><p>{item.excerpt}</p><span className="church-read-link">Read more →</span></Link>)}</div></div></section>}</div>
    </>
  );
}
