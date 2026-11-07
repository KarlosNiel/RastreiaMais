"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/hooks/useAuth";
import { UserMenu } from "@/components/navbar/UserMenu";
import { LandingLogo } from "@/components/home/LandingLogo";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md transition-colors dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <LandingLogo href="/" />

        <nav className="flex items-center gap-2 sm:gap-3">
          {!loading && user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 sm:inline-flex dark:text-zinc-300 dark:hover:text-white"
                href="/auth/login/paciente"
              >
                Sou paciente
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-all hover:bg-[#d9431b] hover:shadow-md hover:shadow-brand/30 active:scale-[0.98]"
                href="/auth/login/profissional"
              >
                Entrar
              </Link>
            </>
          )}

          <button
            aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
            className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="size-4" strokeWidth={2} />
            ) : (
              <Moon className="size-4" strokeWidth={2} />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
