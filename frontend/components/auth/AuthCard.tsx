// frontend/components/auth/AuthCard.tsx
"use client";

import { Button, Card, Divider, Input } from "@heroui/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { app as cfg } from "@/config/rastreiamais";

type Props = {
  children: ReactNode;
  imageSrc?: string;
  heading: string;
  className?: string;
};

export function AuthCard({ children, imageSrc, heading, className }: Props) {
  const supportEmail = (cfg as any)?.links?.supportEmail || "suporte@exemplo.com";

  return (
    <Card
      shadow="md"
      className={cn(
        "w-full sm:w-[75%] lg:w-[94%] mx-auto my-8 max-w-5xl overflow-hidden rounded-2xl border border-divider dark:bg-gray-900 text-foreground",
        "transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Imagem lateral (visível apenas no desktop) */}
        {imageSrc && (
          <div className="relative hidden lg:block md:w-1/2 overflow-hidden rounded-l-2xl">
            <Image
              src={imageSrc}
              alt="Tela de autenticação"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent dark:from-black/40" />
          </div>
        )}

        {/* Conteúdo do card */}
        <div className="flex w-full flex-col justify-center items-center p-8 lg:w-1/2 md:p-12">
          {/* Marca */}
          <div className="mb-6 text-2xl font-bold tracking-tight text-primary select-none mx-auto ">
            Rastreia<span className="text-orange-500">+</span>
          </div>

          {/* Título */}
          <h1 className="mb-8 text-2xl font-semibold text-foreground md:text-3xl mx-auto text-center">
            {heading}
          </h1>

          {/* Formulário / conteúdo */}
          <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
            {children}
          </div>

          {/* Suporte */}
          <div className="mt-6 text-center text-sm text-foreground/70">
            <p>Precisa de ajuda?</p>
            <a
              href={`mailto:${supportEmail}`}
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
            >
              {supportEmail}
            </a>
          </div>

          <Divider className="my-8" />
          <p className="text-center text-sm text-foreground/60 ">
            © <time>{new Date().getFullYear()}</time> Rastreia+. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ====================== Input ====================== */
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
          "h-12 bg-content2 border-default transition-colors",
          "data-[hover=true]:bg-content2",
          "data-[focus=true]:border-primary outline-none",
        ].join(" "),
        input:
          "text-base placeholder:text-foreground/40 focus-visible:outline-none",
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
      variant="solid"
      radius="lg"
      fullWidth
      className={cn(
        "h-12 text-base font-medium rounded-xl shadow-sm",
        "hover:opacity-95 active:translate-y-px transition-all  bg-orange-600 dark:bg-gray-800 text-white dark:text-orange-600"
      )}
      {...props}
    />
  );
}
