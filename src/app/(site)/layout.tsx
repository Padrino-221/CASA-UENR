import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import SiteReveal from '@/components/site/SiteReveal';
import { getGlobalContent, getPageContent, parseList } from '@/lib/cms/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, SOCIAL_LINKS } from '@/lib/seo';

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [content, home] = await Promise.all([getGlobalContent(), getPageContent('home')]);
  const siteName = content['brand.siteName'] || SITE_NAME;
  const gatherings = parseList<{ name: string; time: string }>(home['heroImage.gatherings']);
  const venue = home['heroImage.venue'] || '';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    alternateName: 'Christ Apostolic Students and Associates — UENR',
    url: SITE_URL,
    logo: `${SITE_URL}/casa-logo-white.png`,
    description: SITE_DESCRIPTION,
    address: { '@type': 'PostalAddress', addressLocality: 'Sunyani', addressCountry: 'GH' },
    areaServed: 'University of Energy and Natural Resources, Sunyani, Ghana',
    ...(SOCIAL_LINKS.length > 0 ? { sameAs: SOCIAL_LINKS } : {}),
  };

  return (
    <main className="site min-h-screen w-full bg-white overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="main-container">
        <SiteHeader siteName={siteName} />
        {children}
        <SiteFooter content={content} gatherings={gatherings} venue={venue} />
        <SiteReveal />
      </div>
    </main>
  );
}
