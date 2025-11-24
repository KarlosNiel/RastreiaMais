// app/me/layout.tsx
"use client";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* A11y: pular para conteúdo */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[999] rounded-md border border-divider bg-content1 px-3 py-2 text-sm"
        href="#main"
      >
        Pular para conteúdo
      </a>

      {/* Topbar mínima e consistente */}

      {/* Conteúdo: largura de leitura confortável */}
      <main className="container-app py-6 md:py-8" id="main">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </>
  );
}
