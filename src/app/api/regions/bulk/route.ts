import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { regions } = await request.json();
    
    if (!regions || !Array.isArray(regions)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await db.$transaction(async (tx: any) => {
      const createdRegions = [];
      const createdAdmins = [];

      for (const item of regions) {
        const { regionName, adminName, adminEmail, adminPassword } = item;

        if (!regionName || !adminName || !adminEmail || !adminPassword) {
          throw new Error(`Missing details for region: ${regionName || 'Unknown'}`);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // 1. Create the Region
        const region = await tx.region.create({
          data: { name: regionName }
        });

        // 2. Create the Regional Administrator
        const admin = await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'REGIONAL_ADMIN',
            regionId: region.id
          }
        });

        createdRegions.push(region);
        createdAdmins.push(admin);
      }

      return { regions: createdRegions, admins: createdAdmins };
    });

    return NextResponse.json({ 
      message: `Successfully created ${results.regions.length} regions and administrators.`,
      count: results.regions.length 
    });

  } catch (err) {
    console.error('Regional Bulk Import Error:', err);
    const error = err as { code?: string; message?: string };
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'One or more Region names or Admin Emails already exist in the system.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
