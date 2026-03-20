// frontend/app/not-found.tsx
"use client";

import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";

import { RMButton } from "@/components/ui/RMButton";

export default function NotFound() {
  return (
    <main
      aria-describedby="nf-desc"
      aria-labelledby="nf-title"
      aria-live="polite"
      className="container-app grid min-h-svh md:min-h-dvh place-items-center py-8"
      role="main"
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Card
          className="accent-left w-full rounded-2xl border border-divider bg-content1 p-6 md:p-8 text-foreground shadow-soft"
          shadow="none"
        >
          <div className="stack-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
              {/* ícone decorativo */}
              <svg
                aria-hidden="true"
                fill="currentColor"
                height="22"
                viewBox="0 0 24 24"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>

            <h1 className="ty-h2 md:ty-title" id="nf-title">
              Página não encontrada
            </h1>

            <p className="ty-meta text-foreground/60" id="nf-desc">
              O recurso que você tentou acessar não existe ou foi movido.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {/* CTA principal */}
              <RMButton as={Link} href="/" look="solid" tone="brand">
                Voltar para a Home{" "}
              </RMButton>

              {/* Secundário neutro (borda) */}
              <RMButton
                as={Link}
                href="/pacientes"
                look="outline"
                tone="neutral"
              >
                Lista de Pacientes
              </RMButton>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
