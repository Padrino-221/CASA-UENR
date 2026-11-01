import { jsonLd } from '@/lib/cms/display';
import '../site-redesign.css';
import '../church-inner.css';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { resolveLayoutPreview } from '@/lib/cms/preview';
import SiteReveal from '@/components/site/SiteReveal';
import { getGlobalContent, getPageContent, parseList } from '@/lib/cms/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/seo';


export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const preview = await resolveLayoutPreview();
  const [content, home] = await Promise.all([getGlobalContent(preview), getPageContent('home', preview)]);
  const siteName = content['brand.siteName'] || SITE_NAME;
  const gatherings = parseList<{ name: string; time: string }>(home['heroImage.gatherings']);
  const venue = home['heroImage.venue'] || '';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    alternateName: content['brand.fullName'],
    url: SITE_URL,
    logo: new URL(content['brand.logo'] || '/casa-logo.png', SITE_URL).href,
    description: content['brand.description'] || SITE_DESCRIPTION,

  };

  return (
    <main className="site site-editorial min-h-screen w-full overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
      />
      <a href="#site-content" className="skip-link">Skip to content</a>
      <div className="main-container">
        <SiteHeader content={content} />
        <div id="site-content">{children}</div>
        <SiteFooter content={content} gatherings={gatherings} venue={venue} />
        <SiteReveal />
      </div>
    </main>
  );
}
