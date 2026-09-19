import { redirect } from 'next/navigation';
import { getContentSession } from '@/lib/cms/auth';
import EventManager from '@/components/cms/EventManager';

export const dynamic = 'force-dynamic';

export default async function ContentEventsPage() {
  const session = await getContentSession();
  if (!session) redirect('/login');
  return <EventManager />;
}
