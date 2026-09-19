import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  const authSecret = process.env.AUTH_SECRET || '';
  const authUrl = process.env.AUTH_URL || '';
  const nodeEnv = process.env.NODE_ENV || 'unknown';

  // The diagnostic should use the same sanitization logic as lib/prisma.ts to be useful
  const sanitizedUrl = dbUrl
    .replace(/\\n/g, '')
    .replace(/\\r/g, '')
    .trim()
    .replace(/['"]/g, '')
    .replace(/&?channel_binding=require/g, '');

  // Safe Masking for logs
  const maskUrl = (url: string) => {
    if (!url) return 'Not Defined';
    try {
      const parts = url.split('@');
      if (parts.length > 1) {
        return `postgresql://****:****@${parts[1]}`;
      }
      return 'Malformed URL';
    } catch { return 'Parsing Error'; }
  };

  let dbStatus = 'NOT_TESTED';
  let userCount = 0;
  let connectionError = null;
  let usersList: { email: string; role: string }[] = [];
  let adapterType = 'Unknown';

  try {
    // Attempt a simple query first
    await db.$connect();
    
    // Check what adapter we are using by inspecting the db object if possible, 
    // or just rely on the URL logic in lib/prisma.ts
    adapterType = dbUrl.includes('neon.tech') ? 'Neon Serverless' : 'Standard PG';

    const [count, users] = await Promise.all([
      db.user.count(),
      db.user.findMany({
        take: 5,
        select: { email: true, role: true }
      })
    ]);
    
    userCount = count;
    usersList = users;
    dbStatus = 'SUCCESS';
  } catch (err) {
    dbStatus = 'FAILED';
    const error = err as { message?: string; code?: string; meta?: unknown };
    connectionError = {
      message: error.message || String(err),
      code: error.code,
      meta: error.meta,
    };
  } finally {
    // We don't disconnect here because we want to keep the global instance
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    node_env: nodeEnv,
    system_status: dbStatus === 'SUCCESS' ? 'HEALTHY' : 'DEGRADED',
    database: {
      status: dbStatus,
      adapter: adapterType,
      registered_users: userCount,
      sample_users: usersList,
      error: connectionError,
    },
    environment_variables: {
      DATABASE_URL: {
        raw_length: dbUrl.length,
        sanitized_length: sanitizedUrl.length,
        value: maskUrl(dbUrl),
        sanitized_value: maskUrl(sanitizedUrl),
        is_neon: dbUrl.includes('neon.tech')
      },
      AUTH_SECRET: {
        defined: !!authSecret,
        length: authSecret.length
      },
      AUTH_URL: {
        defined: !!authUrl,
        value: authUrl
      }
    }
  });
}
