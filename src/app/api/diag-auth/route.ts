import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const out: Record<string, unknown> = {
    env: {
      AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
      NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
      AUTH_URL: process.env.AUTH_URL ?? null,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? null,
      VERCEL: process.env.VERCEL ?? null,
      NODE_ENV: process.env.NODE_ENV,
      NODE_VERSION: process.version,
    },
  };

  try {
    const mod = await import('@/auth');
    out.import = 'ok';
    try {
      const req = new NextRequest('http://localhost/api/auth/providers');
      const res = await mod.handlers.GET(req);
      out.providersStatus = res.status;
      out.providersBody = (await res.text()).slice(0, 500);
    } catch (e) {
      const err = e as Error;
      out.providersError = {
        name: err.name,
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 12),
      };
    }
  } catch (e) {
    const err = e as Error;
    out.import = 'failed';
    out.importError = {
      name: err.name,
      message: err.message,
      stack: err.stack?.split('\n').slice(0, 12),
    };
  }

  return NextResponse.json(out);
}
