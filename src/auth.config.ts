import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: 'jwt',
    // MED-01: Short JWT lifetime limits the window for stale role claims.
    // Tokens are automatically rotated every 4 hours.
    maxAge: 4 * 60 * 60, // 4 hours in seconds
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.regionId = user.regionId;
        token.chapterId = user.chapterId;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.regionId = token.regionId;
        session.user.chapterId = token.chapterId;
      }
      return session;
    }
  },
  providers: [], // Empty array, we'll append the credentials provider in auth.ts
} satisfies NextAuthConfig;
