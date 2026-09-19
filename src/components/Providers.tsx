'use client';

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import { SearchProvider } from "@/context/SearchContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
