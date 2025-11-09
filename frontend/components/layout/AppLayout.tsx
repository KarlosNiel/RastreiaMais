"use client";

import { ReactNode } from "react";
import { Button } from "@heroui/button";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import Nav from "@/components/navbar/Nav";
import { UserMenu } from "@/components/navbar/UserMenu";
import Link from "next/link";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-400 bg-clip-text text-transparent">
                Rastreia+
              </span>
            </Link>

            {/* Navegação principal */}
            <Nav />

            {/* Ações do usuário */}
            <div className="flex items-center gap-3">
              {/* Toggle tema */}
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={toggleTheme}
                aria-label="Alternar tema"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </Button>

              {/* Menu do usuário com perfil e logout */}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}