import { redirect } from 'next/navigation';
import { getSecretarySession } from '@/lib/secretary';
import MessagesInbox from '@/components/secretary/MessagesInbox';
export default async function Page() {
  if (!await getSecretarySession()) redirect('/');
  return <MessagesInbox />;
}
