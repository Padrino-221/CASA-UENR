import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import SiteReveal from '@/components/site/SiteReveal';
import { getGlobalContent, getPageContent, parseList } from '@/lib/cms/content';

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [content, home] = await Promise.all([getGlobalContent(), getPageContent('home')]);
  const siteName = content['brand.siteName'] || 'CASA UENR';
  const gatherings = parseList<{ name: string; time: string }>(home['heroImage.gatherings']);
  const venue = home['heroImage.venue'] || '';

  return (
    <main className="site min-h-screen w-full bg-white overflow-x-clip">
      <div className="main-container">
        <SiteHeader siteName={siteName} />
        {children}
        <SiteFooter content={content} gatherings={gatherings} venue={venue} />
        <SiteReveal />
      </div>
    </main>
  );
}
