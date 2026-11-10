// frontend/components/auth/AuthCard.tsx
"use client";

import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, LifeBuoy, Moon, ShieldCheck, Sun } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { LandingLogo } from "@/components/home/LandingLogo";
import { cn } from "@/lib/utils";
import { app as cfg } from "@/config/rastreiamais";

type Props = {
  children: ReactNode;
  imageSrc?: string;
  heading: string;
  subheading?: string;
  className?: string;
};

/* ====================== Linha de batimento animada (limpa) ====================== */
function HeartbeatLine() {
  return (
    <div className="relative h-10 w-full max-w-[320px] overflow-hidden select-none">
      <style>{`
        @keyframes ecgScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .ecg-infinite-flow {
          animation: ecgScroll 2.8s linear infinite;
          will-change: transform;
        }
      `}</style>
      <div className="flex h-full w-[200%] ecg-infinite-flow">
        <svg
          aria-hidden="true"
          className="h-full w-1/2 shrink-0"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 320 40"
        >
          <path
            d="M 0 20 L 100 20 L 108 12 L 116 28 L 122 20 L 140 20 L 148 4 L 156 36 L 162 20 L 320 20"
            stroke="#ec4d23"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        <svg
          aria-hidden="true"
          className="h-full w-1/2 shrink-0"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 320 40"
        >
          <path
            d="M 0 20 L 100 20 L 108 12 L 116 28 L 122 20 L 140 20 L 148 4 L 156 36 L 162 20 L 320 20"
            stroke="#ec4d23"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

export function AuthCard({ children, heading, subheading, className }: Props) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const isProfissional = pathname.includes("/profissional");
  const isPaciente = pathname.includes("/paciente");
  const isLoginFlow = isProfissional || isPaciente;

  const supportEmail =
    (cfg as any)?.links?.supportEmail || "suporte@rastreiamais.com";

  return (
    <div className="h-dvh w-full overflow-hidden bg-white transition-colors lg:grid lg:grid-cols-2 dark:bg-zinc-950">
      {/* ───────────── COLUNA ESQUERDA (desktop) ───────────── */}
      <aside className="relative hidden h-full select-none flex-col justify-between overflow-hidden bg-[#141a2e] p-8 lg:flex xl:p-12 text-white">
        {/* gradientes de fundo */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,#283154_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_100%_100%,rgba(236,77,35,0.22)_0%,transparent_70%)]" />

        <div className="relative z-10">
          <LandingLogo inverted href="/" />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            APS Digital
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-white xl:text-[2.1rem]">
            Cuidado cardiovascular na Atenção Primária.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300/90">
            Estratificação de risco e acompanhamento contínuo de hipertensão e
            diabetes na rede de saúde.
          </p>

          <div className="mt-8">
            <HeartbeatLine />
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          e-SUS APS • Ministério da Saúde © {new Date().getFullYear()}
        </p>
      </aside>

      {/* ───────────── COLUNA DIREITA: formulário ───────────── */}
      <main className="flex h-full flex-col justify-between overflow-y-auto p-6 sm:p-8 lg:p-10">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            href="/"
          >
            <ArrowLeft className="size-4" />
            Início
          </Link>

          <button
            aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
            className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>

        <div className="my-auto w-full max-w-[360px] mx-auto py-4">
          {/* logo no mobile */}
          <div className="mb-6 flex justify-center lg:hidden">
            <LandingLogo href="/" />
          </div>

          {isLoginFlow && (
            <div className="mb-6 grid grid-cols-2 rounded-full bg-slate-100 p-1 dark:bg-zinc-900">
              {[
                {
                  href: "/auth/login/profissional",
                  label: "Profissional",
                  active: isProfissional,
                },
                {
                  href: "/auth/login/paciente",
                  label: "Paciente",
                  active: isPaciente,
                },
              ].map((tab) => (
                <Link
                  key={tab.href}
                  aria-current={tab.active ? "page" : undefined}
                  className={cn(
                    "rounded-full py-2 text-center text-xs font-semibold transition-all",
                    tab.active
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                  )}
                  href={tab.href}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          )}

          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold tracking-[-0.01em] text-slate-900 dark:text-white">
              {heading}
            </h1>
            {subheading && (
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                {subheading}
              </p>
            )}
          </div>

          <div className={cn("w-full", className)}>{children}</div>
        </div>

        <div className="flex shrink-0 items-center justify-between text-xs pt-4">
          <a
            className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            href={`mailto:${supportEmail}`}
          >
            <LifeBuoy className="size-3.5" />
            Suporte
          </a>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" />
            Ambiente Seguro · LGPD
          </span>
        </div>
      </main>
    </div>
  );
}

/* ====================== Input ====================== */
export function TextField({
  className,
  label,
  classNames,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("w-full", className)}
      classNames={{
        base: "w-full",
        label:
          "text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-2 block",
        inputWrapper: cn(
          "h-12 px-4 bg-white dark:bg-zinc-900 border-1 border-slate-200 dark:border-zinc-800 shadow-none",
          "data-[hover=true]:border-slate-300 dark:data-[hover=true]:border-zinc-700",
          "group-data-[focus=true]:border-brand dark:group-data-[focus=true]:border-brand",
          "transition-colors duration-150",
        ),
        input:
          "text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
        ...classNames,
      }}
      label={label}
      labelPlacement="outside"
      radius="full"
      size="md"
      variant="bordered"
      {...props}
    />
  );
}

/* ====================== Botão Submit ====================== */
export function SubmitButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      fullWidth
      className={cn(
        "h-12 rounded-full bg-brand text-sm font-semibold text-white shadow-md shadow-brand/25",
        "transition-all duration-150 hover:bg-[#d9431b] active:scale-[0.99] data-[disabled=true]:opacity-60",
        className,
      )}
      radius="full"
      type="submit"
      variant="solid"
      {...props}
    >
      {children}
    </Button>
  );
}
