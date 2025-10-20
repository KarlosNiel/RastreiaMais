// app/pacientes/(form)/layout.tsx
"use client";

import { RMButton } from "@/components/ui/RMButton";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PacientesFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNew = pathname?.includes("/pacientes/novo");
  const title = isNew ? "Novo Registro" : "Editar Registro";

  return (
    <>
      {/* A11y: pular para conteúdo */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[999] rounded-md border border-divider bg-content1 px-3 py-2 text-sm"
      >
        Pular para conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-divider bg-content1/90 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="container-app py-3 md:py-4">
          {/* Grid = [logo] [título central] [ações] */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4">
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

            {/* Título (sempre centralizado por ocupar a coluna do meio) */}
            <h1 className="text-center text-base md:text-lg font-semibold tracking-tight">
              {title}
            </h1>

            {/* Ações à direita */}
            <div className="ml-auto flex items-center gap-2">
              {/* Grupo principal de ações do formulário */}
              <nav
                aria-label={`Ações - ${title}`}
                className="flex items-center gap-2"
              >
                {/* Observação: usa form="patient-form".
                   Garanta que o <form> em PatientForm.tsx tenha id="patient-form". */}
                <RMButton
                  look="outline"
                  tone="neutral"
                  size="md"
                  type="submit"
                  form="patient-form"
                  aria-label="Salvar rascunho"
                >
                  Salvar rascunho
                </RMButton>

                <RMButton
                  as={Link}
                  href="/pacientes"
                  look="outline"
                  tone="danger"
                  size="md"
                  aria-label="Cancelar e voltar à lista"
                >
                  Cancelar
                </RMButton>

                <RMButton
                  look="solid"
                  tone="brand"
                  size="md"
                  type="submit"
                  form="patient-form"
                  aria-label="Finalizar registro"
                  className="btn-brand"
                >
                  Finalizar Registro
                </RMButton>
              </nav>

              {/* Divisória sutil + ícones secundários (md+) */}
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

      {/* Conteúdo */}
      <main id="main" className="container-app py-6 md:py-8">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </>
  );
}
