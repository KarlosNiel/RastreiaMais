// frontend/app/gestor/layout.tsx
"use client";

import { RMButton } from "@/components/ui/RMButton";
import { Input } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: router.push(`/gestor?q=${encodeURIComponent(new FormData(e.currentTarget).get("q") as string)}`)
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

      <header
        role="banner"
        className="sticky top-0 z-40 border-b border-divider bg-content1/90 supports-[backdrop-filter]:backdrop-blur-md"
      >
        <div className="container-app py-3 md:py-4">
          {/* Grid = [logo] [centro] [ações] */}
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

            {/* Centro (md+): busca */}
            <div className="hidden md:block">
              <form
                onSubmit={onSearchSubmit}
                role="search"
                aria-label="Buscar (paciente, CPF, microárea, condição)"
                className="min-w-[360px] max-w-[680px]"
              >
                <Input
                  type="search"
                  name="q"
                  autoComplete="off"
                  spellCheck="false" // <— corrigido
                  placeholder="Buscar paciente, CPF, microárea, condição…"
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
            </div>

            {/* Ações (direita) */}
            <div className="ml-auto flex items-center gap-2">
              <nav aria-label="Ações" className="flex items-center gap-2">
                <RMButton
                  as={Link}
                  href="/pacientes"
                  look="solid"
                  tone="brand"
                  size="md"
                  className="btn-brand"
                >
                  Lista de Pacientes
                </RMButton>
                <RMButton
                  as={Link}
                  href="/cadastros/novo"
                  look="solid"
                  tone="brand"
                  size="md"
                  className="btn-brand"
                >
                  Novo Cadastro
                </RMButton>
              </nav>

              {/* Ícones secundários (md+) */}
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

            {/* Busca (mobile) */}
            <div className="col-span-full md:hidden">
              <form
                onSubmit={onSearchSubmit}
                role="search"
                aria-label="Buscar (paciente, CPF, microárea, condição)"
              >
                <Input
                  type="search"
                  name="q"
                  autoComplete="off"
                  spellCheck="false" // <— corrigido
                  placeholder="Buscar paciente, CPF, microárea, condição…"
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
                    inputWrapper:
                      "h-11 bg-white border-divider rounded-full shadow-none focus-within:ring-2 focus-within:ring-focus/40",
                    input:
                      "text-sm placeholder:text-foreground/40 focus-visible:outline-none",
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="container-app py-6 md:py-8">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </>
  );
}
