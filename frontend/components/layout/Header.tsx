"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import Link from "next/link";

import { useAuth } from "@/lib/hooks/useAuth";
import { UserMenu } from "@/components/navbar/UserMenu";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              href="/"
            >
              <span className="text-xl font-bold text-primary tracking-tight">
                RastreiaCardio
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão toggle dark mode */}
            <Button
              isIconOnly
              aria-label="Alternar tema"
              className="size-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              size="sm"
              variant="light"
              onPress={toggleTheme}
            >
              {theme === "dark" ? (
                <SunIcon className="size-4.5 text-zinc-100" strokeWidth={2} />
              ) : (
                <MoonIcon className="size-4.5 text-slate-700" strokeWidth={2} />
              )}
            </Button>

            {/* Só mostra se estiver logado */}
            {!loading && user && (
              <>
                {/* Menu do usuário com perfil e logout */}
                <UserMenu user={user} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
