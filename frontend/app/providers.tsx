"use client";

import type { ReactNode } from "react";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { AuthProvider } from "@/context/authContext";

type ProvidersProps = {
  children: ReactNode;
};

function getQueryClient() {
  const g = globalThis as unknown as { __rq?: QueryClient };

  if (!g.__rq) {
    g.__rq = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 60_000, // 1 min
          gcTime: 5 * 60_000, // 5 min
        },
        mutations: {
          retry: 0,
        },
      },
    });
  }

  return g.__rq;
}

export default function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
      storageKey="rastreia-theme"
    >
      {/* locale pt-BR -> DatePicker, textos, etc. em padrão brasileiro */}
      <HeroUIProvider className="font-sans" locale="pt-BR">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
