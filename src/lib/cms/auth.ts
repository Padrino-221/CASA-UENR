import { auth } from '@/auth';

export const CMS_ROLES = ['NATIONAL_ADMIN', 'CONTENT_MANAGER'];

export async function getContentSession() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!session || !role || !CMS_ROLES.includes(role)) return null;
  return session;
}

export async function canAccessContent(): Promise<boolean> {
  return (await getContentSession()) !== null;
}
