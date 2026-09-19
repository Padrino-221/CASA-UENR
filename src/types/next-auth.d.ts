import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role | string;
    regionId?: string | null;
    chapterId?: string | null;
  }

  interface Session {
    user: {
      role?: Role | string;
      regionId?: string | null;
      chapterId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role | string;
    regionId?: string | null;
    chapterId?: string | null;
  }
}
