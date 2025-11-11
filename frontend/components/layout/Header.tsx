"use client";

import { Button } from "@heroui/button";
import { SunIcon, MoonIcon, BellIcon, UserIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
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
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-400 bg-clip-text text-transparent">
              Rastreia+
            </span>
          </div>

          {/* Navegação */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#recursos"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Recursos
            </a>
            <a
              href="#acesso"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Acesso
            </a>
            <a
              href="#sobre"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Botão toggle dark mode */}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={toggleTheme}
              aria-label="Alternar tema"
              className="rounded-lg border-none border-gray-300 dark:border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
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
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Notificações"
                  className="rounded-lg border-none border-gray-300 dark:border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <BellIcon className="size-5 dark:text-white" strokeWidth={2} />
                </Button>

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
