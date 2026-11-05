"use client";

import {
  ArrowLeftIcon,
  HomeIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { app as cfg } from "@/config/rastreiamais";

export default function NotFound() {
  const router = useRouter();
  const supportEmail =
    (cfg as any)?.links?.supportEmail || "suporte@rastreiamais.com";

  return (
    <main
      aria-describedby="nf-desc"
      aria-labelledby="nf-title"
      aria-live="polite"
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors"
      role="main"
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl p-6 sm:p-8 text-center">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-6">
            <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
            RastreiaCardio • APS Digital
          </div>

          {/* Ícone 404 amigável */}
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 shadow-xs">
            <MagnifyingGlassIcon className="size-8" strokeWidth={1.75} />
          </div>

          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            id="nf-title"
          >
            Página não encontrada (404)
          </h1>

          <p
            className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto"
            id="nf-desc"
          >
            O endereço clínico que você tentou acessar não foi localizado ou foi
            movido. Seus dados e atendimentos continuam preservados e seguros.
          </p>

          {/* Ações principais */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              as={Link}
              className="w-full sm:w-auto font-medium text-sm text-white shadow-xs"
              color="primary"
              href="/"
              radius="lg"
              size="md"
              startContent={<HomeIcon className="size-4" />}
            >
              Ir para o Início
            </Button>

            <Button
              className="w-full sm:w-auto font-medium text-sm text-slate-700 dark:text-zinc-300"
              radius="lg"
              size="md"
              startContent={<ArrowLeftIcon className="size-4" />}
              variant="bordered"
              onPress={() => router.back()}
            >
              Voltar tela anterior
            </Button>
          </div>

          {/* Rodapé com suporte */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <LifebuoyIcon className="size-4" />
            <span>Precisa de assistência técnica?</span>
            <a
              className="text-primary hover:underline font-semibold"
              href={`mailto:${supportEmail}`}
            >
              Falar com o Suporte
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
