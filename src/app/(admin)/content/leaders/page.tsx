import { redirect } from 'next/navigation';
import { getContentSession } from '@/lib/cms/auth';
import LeaderManager from '@/components/cms/LeaderManager';

export const dynamic = 'force-dynamic';

export default async function ContentLeadersPage() {
  const session = await getContentSession();
  if (!session) redirect('/login');
  return <LeaderManager />;
}
