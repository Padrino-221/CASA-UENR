import { redirect } from 'next/navigation';
import { getContentSession } from '@/lib/cms/auth';
import ArticleManager from '@/components/cms/ArticleManager';

export const dynamic = 'force-dynamic';

export default async function ContentNewsPage() {
  const session = await getContentSession();
  if (!session) redirect('/login');
  return <ArticleManager />;
}
