// frontend/components/auth/AuthCard.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Heart,
  Moon,
  ShieldCheck,
  Stethoscope,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";
import { app as cfg } from "@/config/rastreiamais";

type Props = {
  children: ReactNode;
  imageSrc?: string;
  heading: string;
  subheading?: string;
  className?: string;
};

export function AuthCard({ children, heading, subheading, className }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isProfissional = pathname.includes("/profissional");
  const isPaciente = pathname.includes("/paciente");
  const isLoginFlow = isProfissional || isPaciente;

  const supportEmail =
    (cfg as any)?.links?.supportEmail || "suporte@rastreiamais.com";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-slate-50 dark:bg-zinc-950 transition-colors">
      {/* ─────────────────────────────────────────────────────────────
          COLUNA LATERAL ESQUERDA (DESKTOP): Limpa, Direta e Discreta
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-slate-900 dark:bg-zinc-950 text-white border-r border-slate-800/60 select-none">
        {/* Glow de fundo sutil */}
        <div className="absolute -top-24 -left-24 size-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />

        {/* Topo: Logo & Identidade Oficial */}
        <div className="relative z-10">
          <BrandLogo
            href="/"
            inverted
            size="md"
            subtitle="APS Digital"
            variant="full"
          />
        </div>

        {/* Centro: Mensagem Direta & Onda de Pulso */}
        <div className="relative z-10 space-y-4 my-auto max-w-sm">
          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-snug">
            Cuidado cardiovascular na Atenção Primária.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Estratificação de risco e acompanhamento contínuo de hipertensão e diabetes na rede de saúde.
          </p>

          {/* Linha cardíaca minimalista */}
          <div className="pt-3">
            <svg
              className="w-full h-10 text-primary-400/70 stroke-current"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 300 40"
            >
              <path d="M 0 20 L 70 20 L 85 5 L 100 35 L 115 10 L 130 25 L 140 20 L 300 20" />
            </svg>
          </div>
        </div>

        {/* Rodapé da Coluna Esquerda */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>e-SUS APS • Ministério da Saúde</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COLUNA DIREITA: Formulário Limpo e Focado
         ───────────────────────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Barra Superior */}
        <div className="flex items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            href="/"
          >
            <ArrowLeft className="size-4" />
            <span>Início</span>
          </Link>

          <Button
            isIconOnly
            aria-label="Alternar tema"
            className="size-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            size="sm"
            variant="light"
            onPress={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-zinc-100" strokeWidth={2} />
            ) : (
              <Moon className="size-4 text-slate-700" strokeWidth={2} />
            )}
          </Button>
        </div>

        {/* Centro: Card Focado */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {/* Logo Padronizado no Mobile */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <BrandLogo href="/" size="sm" variant="horizontal" />
          </div>

          {/* Abas Alternadoras Diretas (Profissional | Paciente) */}
          {isLoginFlow && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/60 dark:bg-zinc-800/60 mb-6 border border-slate-200/60 dark:border-zinc-700/60">
              <Link
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                  isProfissional
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200",
                )}
                href="/auth/login/profissional"
              >
                <Stethoscope className="size-3.5" />
                <span>Profissional</span>
              </Link>

              <Link
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                  isPaciente
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200",
                )}
                href="/auth/login/paciente"
              >
                <User className="size-3.5" />
                <span>Paciente</span>
              </Link>
            </div>
          )}

          {/* Título & Subtítulo */}
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {heading}
            </h1>
            {subheading && (
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {subheading}
              </p>
            )}
          </div>

          {/* Formulário */}
          <div className={cn("space-y-4", className)}>{children}</div>
        </div>

        {/* Rodapé Simples */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 pt-4">
          <a
            className="hover:text-slate-700 dark:hover:text-zinc-300 transition-colors"
            href={`mailto:${supportEmail}`}
          >
            Suporte
          </a>

          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>Ambiente Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== Input Limpo ====================== */
export function TextField({
  className,
  label,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      labelPlacement="outside"
      radius="lg"
      size="md"
      variant="bordered"
      classNames={{
        label: "text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1",
        inputWrapper: cn(
          "h-11 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xs",
          "data-[hover=true]:border-slate-300 dark:data-[hover=true]:border-zinc-700",
          "data-[focus=true]:border-primary dark:data-[focus=true]:border-primary",
          "transition-all duration-150 rounded-xl",
        ),
        input:
          "text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
      }}
      label={label}
      {...props}
    />
  );
}

/* ====================== Botão Submit Direto ====================== */
export function SubmitButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      fullWidth
      className={cn(
        "h-11 text-sm font-semibold rounded-xl text-white shadow-xs",
        "bg-primary hover:bg-primary-600 active:scale-[0.99] transition-all duration-150",
        className,
      )}
      radius="lg"
      type="submit"
      variant="solid"
      {...props}
    >
      {children}
    </Button>
  );
}
