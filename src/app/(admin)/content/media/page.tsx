import { redirect } from 'next/navigation';
import { getContentSession } from '@/lib/cms/auth';
import MediaLibrary from '@/components/cms/MediaLibrary';

export const dynamic = 'force-dynamic';

export default async function ContentMediaPage() {
  const session = await getContentSession();
  if (!session) redirect('/login');
  return <MediaLibrary />;
}
