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

      {/* Conteúdo: largura de leitura confortável */}
      <main id="main" className="container-app py-6 md:py-8">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </>
  );
}
