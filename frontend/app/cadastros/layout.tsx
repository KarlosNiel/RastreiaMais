// app/cadastros/layout.tsx
"use client";

import { RMButton } from "@/components/ui/RMButton";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

/* Mapeia o rótulo amigável do último segmento da rota */
const segmentLabel = (seg?: string) => {
  switch (seg) {
    case "novo":
      return "Novo Profissional";
    default:
      return undefined;
  }
};

export default function CadastrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segments = useSelectedLayoutSegments();
  const last = segments.at(-1);
  const lastLabel = segmentLabel(last);

  return (
    <>
      {/* A11y: pular para conteúdo */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[999] rounded-md border border-divider bg-content1 px-3 py-2 text-sm"
      >
        Pular para conteúdo
      </a>

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-divider bg-content1/90 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="container-app py-3 md:py-4">
          <div className="flex w-full items-center justify-between gap-3 md:gap-4">
            {/* Logo */}
            <Link
              href="/"
              prefetch={false}
              aria-label="Ir para a Home"
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

            {/* Ações (direita) */}
            <div className="ml-auto flex shrink-0 items-center gap-2">
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
      </header>

      {/* Conteúdo */}
      <main id="main" className="container-app py-6 md:py-8">
        {children}
      </main>
    </>
  );
}
