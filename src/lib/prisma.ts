import { PrismaClient } from '@prisma/client';

const getConnectionString = () => {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('DATABASE_URL is not defined or is not a string. Check your environment variables.');
  }

  try {
    // Use native URL API for robust parsing and parameter removal
    const url = new URL(rawUrl.trim().replace(/['"]/g, ''));

    // Remove parameters known to break certain drivers
    url.searchParams.delete('channel_binding');

    const sanitized = url.toString();
    console.log(`[Prisma] Connection host: ${url.host}`);
    return sanitized;
  } catch (err) {
    console.error('[Prisma] URL parsing failed, falling back to manual sanitization', err);
    return rawUrl
      .replace(/\\n/g, '')
      .replace(/\\r/g, '')
      .trim()
      .replace(/['"]/g, '')
      .replace(/&?channel_binding=require/g, '');
  }
};

const connectionString = getConnectionString();

const globalForPrisma = global as unknown as { db?: PrismaClient };

// Pass url explicitly to avoid Next.js bundler losing the outer closure variable
function createClient(url: string): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require('pg');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg');

  // Use standard PG connection pooling for better server reuse and memory efficiency.
  console.log('[Prisma] Initializing with Standard PG adapter');

  const pool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

if (!globalForPrisma.db) {
  globalForPrisma.db = createClient(connectionString);
}

export const db = globalForPrisma.db;

