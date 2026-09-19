import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope, canManageEvents } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user?.role;
  const regionId = session.user?.regionId;
  const chapterId = session.user?.chapterId;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const whereConditions: Record<string, unknown>[] = [
      { scope: 'NATIONAL' },
    ];
    if (role === 'REGIONAL_ADMIN' && regionId) {
      whereConditions.push({ scope: 'REGIONAL', regionId });
      whereConditions.push({ scope: 'LOCAL', chapter: { regionId } });
    }
    if (isLocalScope(role) && chapterId) {
      whereConditions.push({ scope: 'LOCAL', chapterId });
      whereConditions.push({ scope: 'REGIONAL', region: { chapters: { some: { id: chapterId } } } });
    }

    const events = await db.event.findMany({
      where: { OR: whereConditions.length > 0 ? whereConditions : undefined },
      include: {
        chapter: { select: { name: true } },
        region: { select: { name: true } },
        _count: { select: { rsvps: true } }
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit
    });
    return NextResponse.json(events);
  } catch (err) {
    console.error('Events fetch error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, description, date, endDate, venue, category } = await request.json();
    const role = session.user?.role;

    if (!(role === 'NATIONAL_ADMIN' || role === 'REGIONAL_ADMIN' || canManageEvents(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let scope = 'LOCAL';
    if (role === 'NATIONAL_ADMIN') scope = 'NATIONAL';
    else if (role === 'REGIONAL_ADMIN') scope = 'REGIONAL';

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: 'Invalid event date' }, { status: 400 });
    }

    let eventEndDate = null;
    if (endDate) {
      eventEndDate = new Date(endDate);
      if (isNaN(eventEndDate.getTime())) {
        return NextResponse.json({ error: 'Invalid end date' }, { status: 400 });
      }
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        date: eventDate,
        endDate: eventEndDate,
        venue,
        category,
        scope,
        chapterId: isLocalScope(role) ? session.user?.chapterId : null,
        regionId: role === 'REGIONAL_ADMIN' ? session.user?.regionId : null,
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error('Event creation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
