import { auth } from '@/auth';

export async function getSecretarySession() {
  const session = await auth();
  return session?.user?.role === 'SECRETARY' && session.user.chapterId ? session : null;
}
