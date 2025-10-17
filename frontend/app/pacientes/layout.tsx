// app/pacientes/layout.tsx
"use client";

import { RMButton } from "@/components/ui/RMButton";
import { Input } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";

export default function PacientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: integrar com busca global por paciente/CPF (router.push com query)
  }

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
          {/* alinhamento: logo | busca (flex-1) | ícones colados à direita */}
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

            {/* Busca global (nome/CPF) */}
            <form
              onSubmit={onSearchSubmit}
              role="search"
              aria-label="Buscar pacientes"
              className="flex-1 min-w-[280px]"
            >
              <Input
                type="search"
                name="q"
                autoComplete="off"
                spellCheck={false}
                aria-label="Buscar por nome ou CPF"
                placeholder="Buscar por nome ou CPF…"
                radius="full"
                variant="bordered"
                startContent={
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5 text-foreground/45 pointer-events-none"
                  >
                    <path
                      fill="currentColor"
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    />
                  </svg>
                }
                classNames={{
                  base: "w-full",
                  inputWrapper:
                    "h-11 bg-white border-divider rounded-full shadow-none focus-within:ring-2 focus-within:ring-focus/40",
                  input:
                    "text-sm placeholder:text-foreground/40 focus-visible:outline-none",
                }}
              />
            </form>

            {/* Ações rápidas (empurradas para a extrema direita) */}
            <nav
              aria-label="Ações"
              className="ml-auto flex shrink-0 items-center gap-2"
            >
              <RMButton
                as={Link}
                href="/pacientes/novo"
                look="solid"
                tone="brand"
                size="lg"
              >
                Novo Paciente
              </RMButton>

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
            </nav>
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
