"use client";

import { AuthProvider } from "@/context/authContext";
import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

function getQueryClient() {
  const g = globalThis as unknown as { __rq?: QueryClient };
  if (!g.__rq) {
    g.__rq = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 60_000,
          gcTime: 5 * 60_000,
        },
        mutations: { retry: 0 },
      },
    });
  }
  return g.__rq;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="rastreia-theme"
    >
      <HeroUIProvider className="font-sans">
        <QueryClientProvider client={getQueryClient()}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
