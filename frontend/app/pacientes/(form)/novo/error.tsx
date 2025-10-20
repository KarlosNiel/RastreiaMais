// app/pacientes/novo/error.tsx
"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // útil para monitoramento (Sentry/LogRocket/etc.)
    console.error("Erro na página /pacientes/novo:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Card shadow="none" className="border border-default-200">
        <CardBody className="space-y-5">
          <h1 className="text-xl font-semibold">Ops! Algo deu errado</h1>
          <p className="text-foreground-500">
            Ocorreu um problema ao carregar o cadastro de paciente. Você pode
            tentar novamente ou recarregar a página.
          </p>

          <div className="flex items-center gap-3">
            <Button color="primary" onPress={reset}>
              Tentar novamente
            </Button>
            <Button variant="flat" onPress={() => location.reload()}>
              Recarregar
            </Button>
          </div>

          <details className="text-xs text-foreground-500">
            <summary>Detalhes técnicos</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {error?.message}
              {error?.digest ? `\nDigest: ${error.digest}` : ""}
            </pre>
          </details>
        </CardBody>
      </Card>
    </div>
  );
}
