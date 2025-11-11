// app/pacientes/[id]/editar/error.tsx
"use client";

import { useEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na página /pacientes/[id]/editar:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Card shadow="none" className="border border-default-200">
        <CardBody className="space-y-5">
          <h1 className="text-xl font-semibold">
            Não foi possível carregar o paciente
          </h1>
          <p className="text-foreground-500">
            Ocorreu um problema ao carregar os dados do paciente para edição.
            Tente novamente ou recarregue a página. Se o erro persistir,
            verifique sua conexão e permissões de acesso.
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
            <pre className="mt-2 whitespace-pre-wrap wrap-break-word">
              {error?.message}
              {error?.digest ? `\nDigest: ${error.digest}` : ""}
            </pre>
          </details>
        </CardBody>
      </Card>
    </div>
  );
}
