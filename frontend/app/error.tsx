// frontend/app/error.tsx
"use client";

import {
  ArrowPathIcon,
  HomeIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { app as cfg } from "@/config/rastreiamais";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Log estruturado + captura de exceção no Sentry se ativo
    console.error("[RastreiaCardio Error Boundary]", error);
    try {
      // @ts-ignore
      window?.Sentry?.captureException?.(error);
    } catch {}
  }, [error]);

  const supportEmail =
    (cfg as any)?.links?.supportEmail || "suporte@rastreiamais.com";

  function handleReload() {
    try {
      reset();
    } catch {}
    // Recarrega de forma limpa a página para descarregar caches defeituosos
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  async function copyErrorId() {
    const idToCopy = error?.digest || error?.message || "unknown";
    try {
      await navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = idToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <main
      aria-live="polite"
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors"
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl p-6 sm:p-8 text-center">
          {/* Badge superior da aplicação */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-6">
            <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
            RastreiaCardio • APS Digital
          </div>

          {/* Ícone de status amigável e calmo */}
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 shadow-xs">
            <ShieldCheckIcon className="size-8" strokeWidth={1.75} />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ops! Tivemos uma instabilidade momentânea
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            Não se preocupe: os dados clínicos dos seus pacientes continuam
            <strong className="text-slate-800 dark:text-zinc-200 font-semibold"> 100% seguros e preservados</strong>.
            Ocorreu apenas uma falha momentânea na exibição desta tela.
          </p>

          {/* Botões de Ação Principais */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="w-full sm:w-auto h-11 px-6 font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm rounded-xl text-sm transition-all"
              startContent={<ArrowPathIcon className="size-4" strokeWidth={2.2} />}
              onPress={handleReload}
            >
              Recarregar Tela
            </Button>

            <Button
              as={Link}
              className="w-full sm:w-auto h-11 px-5 font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-sm transition-all"
              href="/"
              startContent={<HomeIcon className="size-4 text-slate-500 dark:text-zinc-400" />}
            >
              Voltar ao Início
            </Button>
          </div>

          {/* Link para suporte */}
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <LifebuoyIcon className="size-4 text-slate-400" />
            <span>Precisa de ajuda imediata?</span>
            <a
              className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline"
              href={`mailto:${encodeURIComponent(supportEmail)}?subject=${encodeURIComponent("Suporte - RastreiaCardio")}`}
            >
              Falar com suporte
            </a>
          </div>

          {/* Detalhes Técnicos opcionais (recolhidos por padrão, sem assustar o usuário) */}
          <details className="mt-6 text-left border border-slate-200/70 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/70 dark:bg-zinc-950/50 group">
            <summary className="p-3 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer flex items-center justify-between transition-colors select-none">
              <span>Informações técnicas para o suporte</span>
              <ChevronDownIcon className="size-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-3.5 pt-0 text-xs border-t border-slate-200/60 dark:border-zinc-800/80 space-y-2">
              {error?.digest && (
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                  <span>ID do Evento: <code className="text-slate-700 dark:text-zinc-300">{error.digest}</code></span>
                  <button
                    className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    type="button"
                    onClick={copyErrorId}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="size-3 text-emerald-600" />
                        <span className="text-emerald-600 font-sans">Copiado</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="size-3" />
                        <span className="font-sans">Copiar ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {isDev && (
                <pre className="mt-2 max-h-36 overflow-auto rounded-lg bg-slate-900 text-slate-100 p-2.5 text-[11px] font-mono leading-relaxed">
                  {error?.message || "Nenhuma mensagem detalhada disponível."}
                </pre>
              )}
            </div>
          </details>
        </div>
      </motion.div>
    </main>
  );
}
