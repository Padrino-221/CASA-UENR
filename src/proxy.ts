import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// HIGH-03: In-memory rate limiter for login submissions.
// Limits each IP to RATE_LIMIT_MAX requests within RATE_LIMIT_WINDOW_MS.
// Only the credentials callback is limited; session GETs must pass through.
// NOTE: For multi-instance production deployments, replace this with a Redis-backed store.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) return true;

  record.count += 1;
  return false;
}

// Publicly accessible routes. Everything else requires an authenticated session.
const publicPaths = [
  "/",
  "/about",
  "/departments",
  "/news",
  "/contact",
  "/login",
];

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path + "/"))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting on login submissions only
  if (
    request.method === "POST" &&
    pathname === "/api/auth/callback/credentials"
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // API routes and Next.js internals handle their own access control.
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Every non-public page requires a session. Redirect unauthenticated users
  // (including unknown URLs such as /admin) to the login page.
  if (!isPublicPath(pathname)) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Everything else passes through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and any static file (a path whose last segment
    // contains a dot), so public assets like /casa-logo.png are always served.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\..*).*)",
  ],
};