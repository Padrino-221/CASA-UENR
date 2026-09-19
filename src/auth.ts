import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Auth.js (v5) only reads `AUTH_SECRET` by default. Fall back to
// `NEXTAUTH_SECRET`, and finally derive one from `DATABASE_URL` so the app
// still boots if no secret is configured. Always set `AUTH_SECRET` in production.
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  process.env.DATABASE_URL;

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.warn(
    '[Auth] AUTH_SECRET is not set. Falling back to a derived secret — set AUTH_SECRET in your deployment environment.'
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
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
