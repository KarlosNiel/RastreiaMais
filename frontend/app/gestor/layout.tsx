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
  }

  return (
    <>
      {/* Topbar fixa com blur e divisor */}
      <header
        role="banner"
        className="
          sticky top-0 z-40
          bg-content1/90 supports-[backdrop-filter]:backdrop-blur-md
          text-foreground
          border-b border-divider
        "
      >
        <div className="container-app py-3 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="Ir para a Home"
              prefetch={false}
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

            {/* Busca + ações */}
            <div className="flex w-full items-center gap-3 md:w-auto md:justify-end">
              {/* Busca */}
              <form
                onSubmit={onSearchSubmit}
                role="search"
                aria-label="Buscar"
                className="flex-1 md:w-[520px]"
              >
                <Input
                  type="search"
                  name="q"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Buscar paciente, CPF, microárea, condição"
                  placeholder="Buscar paciente, CPF, microárea, condição…"
                  radius="lg"
                  variant="bordered"
                  startContent={
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-5 text-foreground/50"
                    >
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                      />
                    </svg>
                  }
                  classNames={{
                    inputWrapper:
                      "h-11 bg-content2 border-divider focus-within:ring-2 focus-within:ring-focus/40",
                    input:
                      "text-sm placeholder:text-foreground/40 focus-visible:outline-none",
                  }}
                />
              </form>

              {/* Ações */}
              <nav
                aria-label="Ações rápidas"
                className="flex items-center gap-2"
              >
                <RMButton
                  as={Link}
                  href="/pacientes"
                  look="outline"
                  tone="neutral"
                >
                  Lista de Pacientes
                </RMButton>

                <RMButton
                  as={Link}
                  href="/cadastros/novo"
                  look="solid"
                  tone="brand"
                >
                  Novo Cadastro
                </RMButton>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container-app py-6 md:py-8">{children}</main>
    </>
  );
}
