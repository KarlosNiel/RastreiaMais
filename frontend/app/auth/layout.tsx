// frontend/app/auth/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      role="main"
      aria-label="Autenticação"
      className="bg-background text-foreground min-h-svh md:min-h-dvh"
    >
      {/* Skip link (acessibilidade) */}
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 z-50 rounded-md border border-divider bg-background px-3 py-2 text-sm shadow-soft"
      >
        Pular para o conteúdo
      </a>

      {/* Container alinhado ao grid do projeto */}
      <div className="container-app flex min-h-[inherit] items-center justify-center py-8 md:py-12">
        <Suspense fallback={<span className="sr-only">Carregando…</span>}>
          {/* scroll-mt evita que o skip-link cole no topo */}
          <div id="auth-content" className="w-full max-w-5xl scroll-mt-4">
            {children}
          </div>
        </Suspense>
      </div>
    </main>
  );
}
