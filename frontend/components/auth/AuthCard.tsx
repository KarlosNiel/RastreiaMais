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
      {/* md+: duas colunas; a da esquerda (imagem) estica na mesma altura */}
      <div className="flex flex-col md:flex-row">
        {imageSrc ? (
          <div className="relative hidden md:block md:w-1/2 self-stretch overflow-hidden md:rounded-l-2xl">
            <Image
              src={imageSrc}
              alt="Imagem ilustrativa de autenticação"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover"
            />
            {/* leve máscara para contraste em dark/light */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/30" />
          </div>
        ) : null}

        {/* Coluna de conteúdo */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          {/* Marca */}
          <div className="text-brand-primary font-heading ty-h2 mb-8 select-none">
            Rastreia+
          </div>

          {/* Heading com escala tipográfica do sistema */}
          <h1 className="ty-title md:ty-display text-brand-primary text-center mb-8">
            {heading}
          </h1>

          {/* Form em largura controlada para não “esticar” demais */}
          <div className="w-full mx-auto md:max-w-sm stack-6">{children}</div>

          {/* Suporte */}
          <div className="mt-8 text-center text-sm">
            <p className="text-foreground/60">Precisa falar com a gente?</p>
            <a
              className="text-brand-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 rounded-md"
              href={`mailto:${supportEmail}`}
              aria-label={`Enviar email para ${supportEmail}`}
            >
              {supportEmail}
            </a>
          </div>

          {/* Divisor + Footer */}
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

/* ====================== Campos ======================
   - label fora do campo (sem sobreposição)
   - altura exata h-12 (48px)
   - foco/hover alinhados ao tema
*/
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

/* Botão com brand + micro feedback de clique */
export function SubmitButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="submit"
      className={cn(
        "h-12 w-full rounded-2xl text-base",
        "bg-brand-primary text-white",
        "shadow-[0_3px_0_rgba(0,0,0,0.08)] hover:opacity-95",
        "active:translate-y-px active:shadow-[0_2px_0_rgba(0,0,0,0.10)]",
        "transition"
      )}
      {...props}
    />
  );
}
