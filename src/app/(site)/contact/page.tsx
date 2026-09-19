import { getPageContent } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';
import ContactView from '@/components/site/ContactView';

export default async function ContactPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const content = await getPageContent('contact', preview);
  return <ContactView content={content} />;
}
