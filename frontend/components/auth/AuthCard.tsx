// frontend/components/auth/AuthCard.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Moon,
  ShieldCheck,
  Stethoscope,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

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
          COLUNA LATERAL ESQUERDA (DESKTOP): Vitrine Clínica & Marca
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-slate-950 text-white border-r border-slate-800/80 select-none">
        {/* Gradientes e Efeitos de Fundo */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
        />

        {/* Topo: Logo & Badge APS */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/30">
            <Heart className="size-6 text-white fill-white/20" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Rastreia<span className="text-primary-400">Cardio</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-orange-200 border border-white/10">
                APS Digital
              </span>
            </span>
            <p className="text-xs text-slate-400">Atenção Primária à Saúde</p>
          </div>
        </div>

        {/* Centro: Mensagem de Autoridade & Benefícios */}
        <div className="relative z-10 space-y-6 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-orange-200">
            <span className="size-2 rounded-full bg-orange-400 animate-pulse" />
            Estratificação de Risco Cardiovascular
          </div>

          <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Cuidado preventivo e contínuo para quem mais precisa.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Plataforma clínica dedicada à equipe multidisciplinar da APS e ao
            cidadão, alinhada aos protocolos de hipertensão e diabetes do
            Ministério da Saúde e e-SUS APS.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-200">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>Escore de Framingham e Diretrizes SBC automatizados</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>Monitoramento longitudinal de pressão e glicemia</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>Segurança clínica integral e conformidade com a LGPD</span>
            </div>
          </div>
        </div>

        {/* Rodapé da Coluna Esquerda: Cartão de Confiança / Indicador */}
        <div className="relative z-10 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                Rede APS Operacional
              </span>
              <span className="text-[11px] text-slate-400 font-mono">SUS • Brasil</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Linha de cuidado cardiovascular integrada para médicos, enfermeiros,
              gestores e pacientes.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
            <span>© {new Date().getFullYear()} RastreiaCardio</span>
            <span>Versão 2.4 • Produção</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COLUNA DIREITA: Formulário e Interação
         ───────────────────────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Barra Superior da Coluna Direita */}
        <div className="flex items-center justify-between gap-4 pb-6">
          <Link
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            href="/"
          >
            <ArrowLeft className="size-4" />
            <span>Voltar ao Início</span>
          </Link>

          <Button
            isIconOnly
            aria-label="Alternar tema"
            className="size-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            size="sm"
            variant="light"
            onPress={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="size-4.5 text-zinc-100" strokeWidth={2} />
            ) : (
              <Moon className="size-4.5 text-slate-700" strokeWidth={2} />
            )}
          </Button>
        </div>

        {/* Área Central: Card do Formulário */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          {/* Logo Visível no Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-md shadow-primary/25">
              <Heart className="size-5 fill-white/20" strokeWidth={2.2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Rastreia<span className="text-primary">Cardio</span>
            </span>
          </div>

          {/* Abas Alternadoras de Perfil (Profissional vs Paciente) */}
          {isLoginFlow && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-zinc-800/70 mb-8 border border-slate-200/50 dark:border-zinc-700/50 shadow-inner">
              <Link
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all",
                  isProfissional
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100",
                )}
                href="/auth/login/profissional"
              >
                <Stethoscope className="size-4" />
                <span>Profissional / Gestor</span>
              </Link>

              <Link
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all",
                  isPaciente
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100",
                )}
                href="/auth/login/paciente"
              >
                <User className="size-4" />
                <span>Cidadão / Paciente</span>
              </Link>
            </div>
          )}

          {/* Cabeçalho do Formulário */}
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {heading}
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              {subheading ||
                (isProfissional
                  ? "Informe seu e-mail institucional ou usuário APS para acessar o painel clínico."
                  : isPaciente
                    ? "Digite seu CPF ou e-mail cadastrado na sua Unidade Básica de Saúde."
                    : "Informe seus dados de acesso.")}
            </p>
          </div>

          {/* Conteúdo Dinâmico (Inputs e Botões) */}
          <div className={cn("space-y-4", className)}>{children}</div>
        </div>

        {/* Rodapé Inferior da Coluna Direita */}
        <div className="pt-6 border-t border-slate-200/70 dark:border-zinc-800/70 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500 dark:text-zinc-400">
          <p>
            Dúvidas no acesso?{" "}
            <a
              className="text-primary hover:underline font-semibold"
              href={`mailto:${supportEmail}`}
            >
              Falar com o Suporte
            </a>
          </p>

          <div className="mt-2 sm:mt-0 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ambiente Seguro • Criptografia TLS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== Input Modernizado ====================== */
export function TextField({
  className,
  label,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Input
        labelPlacement="outside"
        radius="lg"
        size="md"
        variant="bordered"
        classNames={{
          label: "text-xs font-semibold text-slate-700 dark:text-zinc-300",
          inputWrapper: cn(
            "h-12 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs",
            "data-[hover=true]:border-primary/60 dark:data-[hover=true]:border-primary/60",
            "data-[focus=true]:border-primary dark:data-[focus=true]:border-primary focus-within:ring-2 focus-within:ring-primary/20",
            "transition-all duration-150 rounded-xl",
          ),
          input:
            "text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
        }}
        label={label}
        {...props}
      />
    </div>
  );
}

/* ====================== Botão Submit com Destaque ====================== */
export function SubmitButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      fullWidth
      className={cn(
        "h-12 text-sm font-semibold rounded-xl text-white shadow-md shadow-primary/25",
        "bg-gradient-to-r from-primary to-orange-600 hover:from-primary-600 hover:to-orange-700",
        "active:scale-[0.99] transition-all duration-150",
        className,
      )}
      radius="lg"
      size="lg"
      type="submit"
      variant="solid"
      {...props}
    >
      {children}
    </Button>
  );
}
