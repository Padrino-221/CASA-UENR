import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { SUB_ACCOUNT_ROLES } from '@/lib/roles';

const ADMIN_ROLES = [
  'NATIONAL_ADMIN',
  'REGIONAL_ADMIN',
  'LOCAL_ADMIN',
  'CONTENT_MANAGER',
  'FINANCE',
  'SECRETARY',
];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requesterRole = session.user.role as string;
    const { name, email, role, regionId, chapterId } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    let scopeRegionId: string | null = null;
    let scopeChapterId: string | null = null;

    if (requesterRole === 'NATIONAL_ADMIN') {
      if (role === 'REGIONAL_ADMIN' && !regionId) {
        return NextResponse.json({ error: 'Region is required for Regional Admin' }, { status: 400 });
      }
      if (role === 'LOCAL_ADMIN' && (!chapterId || !regionId)) {
        return NextResponse.json({ error: 'Region and Chapter are required for Local Admin' }, { status: 400 });
      }
      if ((role === 'FINANCE' || role === 'SECRETARY') && !chapterId) {
        return NextResponse.json({ error: 'Chapter is required for this role' }, { status: 400 });
      }
      scopeRegionId = regionId || null;
      scopeChapterId = chapterId || null;
    } else if (requesterRole === 'LOCAL_ADMIN') {
      // Local admins may only create chapter-scoped sub-accounts.
      if (!(SUB_ACCOUNT_ROLES as readonly string[]).includes(role)) {
        return NextResponse.json(
          { error: 'Local admins can only create Finance or Secretary sub-accounts' },
          { status: 403 }
        );
      }
      if (!session.user.chapterId) {
        return NextResponse.json({ error: 'Your account is not assigned to a chapter' }, { status: 400 });
      }
      scopeChapterId = session.user.chapterId;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized. Requires National Administrator or Local Administrator clearance.' },
        { status: 403 }
      );
    }

    const tempPassword = randomBytes(12).toString('base64url');
    const password = await bcrypt.hash(tempPassword, 10);

    const checkExisting = await db.user.findUnique({ where: { email } });
    if (checkExisting) {
      return NextResponse.json({ error: 'Email already registered in system.' }, { status: 409 });
    }

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password,
        role,
        regionId: scopeRegionId,
        chapterId: scopeChapterId,
      },
      include: {
        region: { select: { name: true } },
        chapter: { select: { name: true } },
      },
    });

    const userSafe = { ...newUser };
    delete (userSafe as { password?: unknown }).password;

    return NextResponse.json(
      {
        ...userSafe,
        tempPassword,
        mustChangePassword: true,
        notice: 'Share this temporary password securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
