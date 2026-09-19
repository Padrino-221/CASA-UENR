import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        region: { select: { name: true } },
        chapter: { 
          select: { 
            name: true,
            region: { select: { name: true } }
          } 
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Strip password
    const safeUser = { ...user };
    delete (safeUser as { password?: unknown }).password;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // MED-04: Password changes must go through /api/user/change-password
    // which verifies the old password first. Profile PATCH only allows name updates.
    const { name } = await request.json();
    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: { id: updated.id, name: updated.name, email: updated.email } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
