import type { Metadata } from 'next';
import { getPageContent } from '@/lib/cms/content';
import { resolvePreview, type SiteSearchParams } from '@/lib/cms/preview';
import ContactView from '@/components/site/ContactView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Get in touch with CASA UENR — send a message, find us on campus at the University of Energy and Natural Resources, Sunyani, or reach us by email and phone.',
  path: '/contact',
});

export default async function ContactPage({ searchParams }: { searchParams: SiteSearchParams }) {
  const preview = await resolvePreview(searchParams);
  const content = await getPageContent('contact', preview);
  return <ContactView content={content} />;
}
