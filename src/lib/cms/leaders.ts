import { db } from '@/lib/prisma';

export interface CmsLeader {
  id?: string;
  image?: string;
  initials: string;
  name: string;
  role: string;
  bio: string;
  color: string;
}

type LeaderRow = {
  id: string;
  imageUrl: string | null;
  initials: string;
  name: string;
  role: string;
  bio: string;
  color: string;
};

function mapRow(row: LeaderRow): CmsLeader {
  return {
    id: row.id,
    image: row.imageUrl || undefined,
    initials: row.initials,
    name: row.name,
    role: row.role,
    bio: row.bio,
    color: row.color,
  };
}

export async function getPublishedLeaders(): Promise<CmsLeader[]> {
  try {
    const rows = (await db.siteLeader.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })) as LeaderRow[];
    return rows.map(mapRow);
  } catch {
    return [];
  }
}
