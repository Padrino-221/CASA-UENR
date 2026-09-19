import { db } from '@/lib/prisma';
import { DEFAULT_LEADERS } from './schema';

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

function fromDefaults(): CmsLeader[] {
  return DEFAULT_LEADERS.map((leader) => ({
    image: leader.image || undefined,
    initials: leader.initials,
    name: leader.name,
    role: leader.role,
    bio: leader.bio,
    color: leader.color,
  }));
}

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
    if (rows.length === 0) return fromDefaults();
    return rows.map(mapRow);
  } catch {
    return fromDefaults();
  }
}
