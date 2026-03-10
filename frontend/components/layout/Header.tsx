"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/lib/hooks/useAuth";
import { UserMenu } from "@/components/navbar/UserMenu";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white backdrop-blur dark:border-gray-800 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center mb-2.5">
            <Button
              as={Link}
              className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              href="/"
              radius="full"
              variant="light"
            >
              <span className="text-xl font-bold text-primary tracking-tight">
                RastreiaCardio
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão toggle dark mode */}
            <Button
              isIconOnly
              aria-label="Alternar tema"
              className="rounded-lg border-none border-gray-300 dark:border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
              size="sm"
              variant="light"
              onPress={toggleTheme}
            >
              {theme === "dark" ? (
                <SunIcon className="size-5 text-white" strokeWidth={2} />
              ) : (
                <MoonIcon className="size-5 text-gray-700" strokeWidth={2} />
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
