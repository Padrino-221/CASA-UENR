import { getPageContent } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';
import ContactView from '@/components/site/ContactView';
import { cmsPageMetadata } from '@/lib/cms/metadata';

export async function generateMetadata({ searchParams }: { searchParams: SiteSearchParams }) { return cmsPageMetadata('contact', await resolvePreview(searchParams)); }

export default async function ContactPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const content = await getPageContent('contact', preview);
  return <ContactView content={content} />;
}
