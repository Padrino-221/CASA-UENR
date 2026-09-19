import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'NATIONAL_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Requires National Administrator clearance.' }, { status: 403 });
    }

    const { name, email, role, regionId, chapterId } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'REGIONAL_ADMIN' && !regionId) {
      return NextResponse.json({ error: 'Region is required for Regional Admin' }, { status: 400 });
    }

    if (role === 'LOCAL_ADMIN' && (!chapterId || !regionId)) {
      return NextResponse.json({ error: 'Region and Chapter are required for Local Admin' }, { status: 400 });
    }

    const validRoles = ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'CONTENT_MANAGER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
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
        ...(role === 'REGIONAL_ADMIN' ? { regionId } : {}),
        ...(role === 'LOCAL_ADMIN' ? { regionId, chapterId } : {}),
      },
      include: {
        region: { select: { name: true } },
        chapter: { select: { name: true } },
      }
    });

    const userSafe = { ...newUser };
    delete (userSafe as { password?: unknown }).password;

    return NextResponse.json({
      ...userSafe,
      tempPassword,
      mustChangePassword: true,
      notice: 'Share this temporary password securely. It will not be shown again.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
