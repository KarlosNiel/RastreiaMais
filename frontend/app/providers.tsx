// frontend/app/providers.tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

// Carrega DevTools somente em desenvolvimento (sem SSR)
const RQDevtools: ComponentType<any> | null =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (m) => m.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : null;

// Singleton para o QueryClient (evita recriar entre renders)
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
  const queryClient = getQueryClient();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // ou "system" se preferir seguir o SO
      enableSystem
      disableTransitionOnChange
      storageKey="rastreia-theme"
    >
      <HeroUIProvider className="font-sans">
        <QueryClientProvider client={queryClient}>
          {children}
          {RQDevtools ? (
            <RQDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          ) : null}
        </QueryClientProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
