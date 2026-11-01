import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Auth.js builds action URLs with `new URL(AUTH_URL ?? NEXTAUTH_URL)`, which
// throws if the value has no scheme (e.g. "my-app.vercel.app"). Normalise it.
function normalizeEnvUrl(name: 'AUTH_URL' | 'NEXTAUTH_URL') {
  const raw = process.env[name];
  if (!raw || /^https?:\/\//i.test(raw)) return;
  const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(raw);
  process.env[name] = `${isLocal ? 'http' : 'https'}://${raw.replace(/^\/+/, '')}`;
}
normalizeEnvUrl('AUTH_URL');
normalizeEnvUrl('NEXTAUTH_URL');

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret || authSecret.length < 32 || authSecret.startsWith('replace-')) {
  throw new Error('Set AUTH_SECRET to a random secret of at least 32 characters.');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (!token.id) return null;
      const current = await db.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, chapterId: true, regionId: true, name: true, email: true },
      });
      if (!current) return null;
      return { ...token, ...current };
    },
  },
  secret: authSecret,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[Auth] Missing credentials in request');
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) {
          console.warn(`[Auth] User not found: ${credentials.email}`);
          return null;
        }

        if (!user.password) {
          console.error(`[Auth] User has no password set: ${user.email}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          console.warn(`[Auth] Password mismatch for: ${user.email}`);
          return null;
        }

        console.log(`[Auth] Successful login for: ${user.email}`);

        // LOW-03: Record successful login in the audit trail (non-blocking)
        db.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entity: 'USER',
            entityId: user.id,
            metadata: JSON.stringify({ email: user.email, role: user.role })
          }
        }).catch((err: unknown) => console.error('Audit login log failed:', err));

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          regionId: user.regionId,
          chapterId: user.chapterId
        };
      }
    })
  ],
});
