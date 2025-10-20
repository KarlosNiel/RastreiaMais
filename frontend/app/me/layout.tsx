// app/me/layout.tsx
"use client";

import { RMButton } from "@/components/ui/RMButton";
import Image from "next/image";
import Link from "next/link";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* A11y: pular para conteúdo */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[999] rounded-md border border-divider bg-content1 px-3 py-2 text-sm"
      >
        Pular para conteúdo
      </a>

      {/* Topbar mínima e consistente */}
      <header className="sticky top-0 z-40 border-b border-divider bg-content1/90 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="container-app py-3 md:py-4">
          {/* Grid = [logo] [slot central] [ações] */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Ir para a Home"
              prefetch={false}
              className="inline-flex shrink-0 items-center gap-2"
            >
              <Image
                src="/Rastreia+.svg"
                alt="Rastreia+"
                width={156}
                height={32}
                priority
                className="h-8 w-auto"
              />
            </Link>

            {/* Slot central reservado (ex.: título ou breadcrumb da página /me) */}
            <div className="min-h-6" />

            {/* Ações compactas à direita */}
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l border-divider">
                <RMButton
                  look="ghost"
                  tone="neutral"
                  iconOnly
                  aria-label="Notificações"
                >
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                    />
                  </svg>
                </RMButton>

                <RMButton
                  as={Link}
                  href="/perfil"
                  look="ghost"
                  tone="neutral"
                  iconOnly
                  aria-label="Abrir perfil"
                >
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                    />
                  </svg>
                </RMButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo: largura de leitura confortável */}
      <main id="main" className="container-app py-6 md:py-8">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </>
  );
}
