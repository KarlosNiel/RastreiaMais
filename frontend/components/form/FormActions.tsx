// components/form/FormActions.tsx
"use client";

import Link from "next/link";
import { RMButton } from "@/components/ui/RMButton";

export function FormActions({
  cancelHref,
  submitting,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
}: {
  cancelHref: string;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-end gap-3 md:col-span-2">
      <RMButton as={Link} href={cancelHref} look="outline" tone="danger">
        {cancelLabel}
      </RMButton>
      <RMButton type="submit" look="solid" tone="brand" isDisabled={submitting}>
        {submitting ? "Enviando…" : submitLabel}
      </RMButton>
    </div>
  );
}
