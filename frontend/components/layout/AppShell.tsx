"use client";

import { Bars3Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/lib/hooks/useAuth";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotas de formulário de autenticação dedicada (não exibem header/footer de marketing para foco total)
  const isAuthFormRoute =
    pathname.startsWith("/auth/login/") ||
    pathname.startsWith("/auth/recuperar-senha") ||
    pathname.startsWith("/auth/redefinir-senha");

  if (isAuthFormRoute) {
    return (
      <main className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 transition-colors">
        {children}
      </main>
    );
  }

  // Rotas públicas de apresentação (landing page e portal geral)
  const isPublicRoute =
    pathname === "/" || pathname.startsWith("/auth/") || pathname === "/auth";

  if (isPublicRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="relative z-50">
          <Header />
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  const userInitials = (
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    "RC"
  ).toUpperCase();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Rotas de aplicação / dashboard autenticado
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50/70 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Sidebar Colapsável (Desktop) e Gaveta (Mobile) */}
      <AppSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Conteúdo Principal da Aplicação */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Barra superior no mobile */}
        <header className="md:hidden flex h-14 shrink-0 items-center justify-between px-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menu de navegação"
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              type="button"
              onClick={() => setIsMobileOpen(true)}
            >
              <Bars3Icon className="size-6" strokeWidth={2} />
            </button>
            <BrandLogo size="xs" variant="horizontal" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              aria-label="Alternar tema"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              type="button"
              onClick={toggleTheme}
            >
              {mounted && theme === "dark" ? (
                <SunIcon className="size-4.5" strokeWidth={2} />
              ) : (
                <MoonIcon className="size-4.5" strokeWidth={2} />
              )}
            </button>

            <button
              aria-label="Perfil do usuário"
              className="size-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs"
              type="button"
              onClick={() => setIsMobileOpen(true)}
            >
              {userInitials}
            </button>
          </div>
        </header>

        {/* Área rolável do conteúdo principal */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
