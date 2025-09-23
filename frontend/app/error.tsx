// frontend/app/error.tsx
"use client";

import { app as cfg } from "@/config/rastreiamais";
import { Button, Card } from "@heroui/react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log básico + captura opcional (Sentry/LogRocket) se estiverem presentes
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
    } catch {}
  }

  return (
    <main className="container-app grid min-h-svh md:min-h-dvh place-items-center py-8">
      <Card
        className="w-full max-w-md rounded-2xl border border-divider bg-content1 p-6 md:p-8 text-foreground shadow-soft"
        role="alert"
        aria-live="assertive"
        aria-describedby="err-desc"
      >
        <div className="text-center stack-6">
          <h1 className="ty-h2 md:ty-title">Algo deu errado</h1>

          <p id="err-desc" className="ty-meta text-foreground/60">
            Tente novamente. Se o problema persistir, fale com o suporte.
          </p>

          {/* Dev-only: detalhes do erro */}
          {process.env.NODE_ENV === "development" && (
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
                    size="sm"
                    variant="flat"
                    onPress={copyDigest}
                    className="text-xs"
                  >
                    Copiar ID
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="flat" onPress={() => reset()}>
              Tentar novamente
            </Button>

            <Button as={Link} href="/" className="bg-brand-primary text-white">
              Ir para a Home
            </Button>

            <Button
              as="a"
              href={`mailto:${supportEmail}?subject=Erro%20no%20Rastreia%2B${
                error?.digest
                  ? `%20(digest%3A%20${encodeURIComponent(error.digest)})`
                  : ""
              }`}
              variant="ghost"
            >
              Suporte
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
