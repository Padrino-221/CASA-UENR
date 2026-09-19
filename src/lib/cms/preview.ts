import { auth } from '@/auth';
import { CMS_ROLES } from './auth';

export type SiteSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function resolvePreview(searchParams?: SiteSearchParams): Promise<boolean> {
  if (!searchParams) return false;
  const params = await searchParams;
  if (params.preview !== '1') return false;

  const session = await auth();
  const role = session?.user?.role as string | undefined;
  return Boolean(role && CMS_ROLES.includes(role));
}
