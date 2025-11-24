// frontend/app/error.tsx
"use client";

import { Button, Card } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { app as cfg } from "@/config/rastreiamais";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Log básico + captura opcional (Sentry/LogRocket) se estiverem presentes
    // eslint-disable-next-line no-console
    console.error(error);
    try {
      // @ts-ignore - depende da configuração do projeto
      window?.Sentry?.captureException?.(error);
      // @ts-ignore
      window?.LogRocket?.captureException?.(error);
    } catch {}
  }, [error]);

  const supportEmail =
    (cfg as any)?.links?.supportEmail || "suporte@exemplo.com";

  async function copyDigest() {
    if (!error?.digest) return;
    try {
      await navigator.clipboard.writeText(error.digest);
    } catch {
      // Fallback simples
      const el = document.createElement("textarea");

      el.value = error.digest;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }

  return (
    <main
      aria-live="polite"
      className="container-app grid min-h-svh md:min-h-dvh place-items-center py-8"
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Card
          aria-describedby="err-desc"
          aria-labelledby="err-title"
          className="accent-left w-full rounded-2xl border border-divider bg-content1 p-6 md:p-8 text-foreground shadow-soft"
          role="alert"
          shadow="none"
        >
          <div className="stack-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              {/* ícone simples */}
              <svg
                aria-hidden="true"
                fill="currentColor"
                height="22"
                viewBox="0 0 24 24"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10
                10-4.48 10-10S17.52 2 12 2z"
                />
              </svg>
            </div>

            <h1 className="ty-h2 md:ty-title" id="err-title">
              Algo deu errado
            </h1>

            <p className="ty-meta text-foreground/60" id="err-desc">
              Tente novamente. Se o problema persistir, fale com o suporte.
            </p>

            {/* Dev-only: detalhes do erro */}
            {isDev && (
              <div className="text-left">
                <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-content2 p-3 text-xs leading-relaxed">
                  {error?.message ?? "Erro sem mensagem."}
                  {error?.digest ? `\n\n[digest] ${error.digest}` : ""}
                </pre>

                {error?.digest ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-foreground/60">
                      ID do erro: <code>{error.digest}</code>
                    </span>
                    <Button
                      className="text-xs"
                      color="default"
                      size="sm"
                      variant="light"
                      onPress={copyDigest}
                    >
                      Copiar ID
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                className="ring-offset-app ring-focus focus-visible:ring-2"
                color="primary"
                variant="solid"
                onPress={() => reset()}
              >
                Tentar novamente
              </Button>

              <Button
                as={Link}
                className="ring-offset-app ring-focus focus-visible:ring-2"
                color="default"
                href="/"
                variant="bordered"
              >
                Ir para a Home
              </Button>

              <Button
                as="a"
                className="ring-offset-app ring-focus focus-visible:ring-2"
                color="default"
                href={`mailto:${encodeURIComponent(
                  supportEmail,
                )}?subject=${encodeURIComponent("Erro no Rastreia+")}${
                  error?.digest
                    ? `&body=${encodeURIComponent(
                        `ID do erro (digest): ${error.digest}`,
                      )}`
                    : ""
                }`}
                variant="light"
              >
                Suporte
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
