import { redirect } from 'next/navigation';
import { getSecretarySession } from '@/lib/secretary';
import Announcements from '@/components/secretary/Announcements';
export default async function Page() {
  if (!await getSecretarySession()) redirect('/');
  return <Announcements />;
}
