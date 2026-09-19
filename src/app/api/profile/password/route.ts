import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Incomplete credentials' }, { status: 400 });
    }

    // 1. Fetch current user with password
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Identity verification failed' }, { status: 404 });
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Security mismatch: Current password invalid' }, { status: 403 });
    }

    // 3. Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    // 4. Record Audit Log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PASSWORD_CHANGE',
        entity: 'USER',
        entityId: session.user.id,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() })
      }
    });

    return NextResponse.json({ message: 'Security keys updated successfully' });

  } catch (error) {
    console.error('Password Change Error:', error);
    return NextResponse.json({ error: 'Internal system fault' }, { status: 500 });
  }
}
