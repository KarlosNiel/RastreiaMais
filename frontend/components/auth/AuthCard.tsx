// frontend/components/auth/AuthCard.tsx
"use client";

import { app as cfg } from "@/config/rastreiamais";
import { cn } from "@/lib/utils";
import { Button, Card, Divider, Input } from "@heroui/react";
import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  imageSrc?: string;
  heading: string;
  className?: string;
};

export function AuthCard({ children, imageSrc, heading, className }: Props) {
  const supportEmail =
    (cfg as any)?.links?.supportEmail || "suporte@exemplo.com";

  return (
    <Card
      shadow="none"
      className={cn(
        "w-full max-w-5xl overflow-hidden rounded-2xl",
        "bg-content1 text-foreground border border-divider shadow-soft",
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Coluna da imagem (desktop) */}
        {imageSrc ? (
          <div className="relative hidden self-stretch overflow-hidden md:block md:w-1/2 md:rounded-l-2xl">
            <Image
              src={imageSrc}
              alt="Imagem ilustrativa de autenticação"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/30" />
          </div>
        ) : null}

        {/* Coluna do conteúdo */}
        <div className="flex w-full flex-col p-8 md:w-1/2 md:p-12">
          {/* Marca */}
          <div className="mb-6 select-none font-heading text-[var(--brand)] ty-h2">
            Rastreia+
          </div>

          {/* Heading (alinhado ao Figma) */}
          <h1 className="mb-8 text-left font-heading text-[var(--brand)] ty-title md:ty-display">
            {heading}
          </h1>

          {/* Área do formulário */}
          <div className="stack-6 mx-auto w-full md:max-w-sm">{children}</div>

          {/* Contato de suporte */}
          <div className="mt-8 text-center text-sm">
            <p className="text-foreground/60">Precisa falar com a gente?</p>
            <a
              className="underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/50 rounded-md text-[var(--brand)]"
              href={`mailto:${supportEmail}`}
              aria-label={`Enviar email para ${supportEmail}`}
            >
              {supportEmail}
            </a>
          </div>

          <Divider className="mt-8" />
          <div className="pt-4 text-center text-xs text-foreground/60">
            © <time suppressHydrationWarning>{new Date().getFullYear()}</time>{" "}
            Rastreia+. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ====================== Campos ====================== */
export function TextField(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      radius="lg"
      size="lg"
      variant="bordered"
      labelPlacement="outside"
      className="w-full"
      classNames={{
        label: "text-sm text-foreground/70 mb-1",
        inputWrapper: [
          "h-12",
          "bg-content2 border-default",
          "data-[hover=true]:bg-content2",
          "data-[focus=true]:border-primary",
          "outline-none ring-0 focus-visible:outline-none",
        ].join(" "),
        input:
          "text-base placeholder:text-foreground/40 focus-visible:outline-none",
        description: "text-xs text-foreground/60",
        errorMessage: "text-xs text-danger",
        base: "focus-within:outline-none",
        mainWrapper: "focus-within:outline-none",
        innerWrapper: "focus-within:outline-none",
      }}
      {...props}
    />
  );
}

/* ====================== Botão Submit ====================== */
export function SubmitButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="submit"
      color="primary"
      variant="solid"
      radius="xl"
      className={cn(
        "h-12 w-full rounded-2xl text-base",
        "shadow-[0_3px_0_rgba(0,0,0,0.08)] hover:opacity-95",
        "active:translate-y-px active:shadow-[0_2px_0_rgba(0,0,0,0.10)]",
        // Segurança extra caso estilhos globais de <a> mudem:
        "[&_[data-slot=label]]:!text-white [&_[data-slot=content]]:!text-white [&_span]:!text-white"
      )}
      {...props}
    />
  );
}
