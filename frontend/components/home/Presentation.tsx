"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  Users,
} from "lucide-react";

type Risk = "Alto" | "Moderado" | "Baixo";

const RISK_STYLE: Record<Risk, { cls: string; Icon: typeof AlertCircle }> = {
  Alto: {
    cls: "bg-rose-50 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
    Icon: AlertCircle,
  },
  Moderado: {
    cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
    Icon: AlertTriangle,
  },
  Baixo: {
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
    Icon: CheckCircle2,
  },
};

const PATIENTS: { name: string; pa: string; risk: Risk }[] = [
  { name: "Maria das Graças S.", pa: "168/102", risk: "Alto" },
  { name: "José Ribeiro S.", pa: "142/88", risk: "Moderado" },
  { name: "Antônia F. Lima", pa: "124/80", risk: "Baixo" },
];

const HIGHLIGHTS = [
  {
    Icon: Users,
    title: "Gestão de Pacientes",
    desc: "Cadastro biopsicossocial único, com fluxo adaptativo por condição.",
    tone: "bg-orange-50 text-brand dark:bg-orange-500/10",
  },
  {
    Icon: Activity,
    title: "Monitoramento Contínuo",
    desc: "Alertas automáticos de PA e glicemia para busca ativa.",
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    Icon: LayoutGrid,
    title: "Dashboards e Formulários",
    desc: "Indicadores por microárea e SOAP pronto para o PEC.",
    tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  },
];

function Sparkline({ points, color }: { points: string; color: string }) {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-[72px] shrink-0"
      fill="none"
      viewBox="0 0 72 32"
    >
      <polyline
        points={points}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div
      aria-label="Prévia do dashboard clínico"
      className="w-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40"
      role="img"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Microárea · Jardim Magnólia
          </p>
          <p className="font-display text-base font-bold text-slate-900 dark:text-zinc-100">
            Dashboard Clínico
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Ao vivo
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="flex items-end justify-between gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-zinc-800/60">
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Pacientes
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              3.198
            </p>
          </div>
          <Sparkline
            color="#2563eb"
            points="2,26 16,20 28,20 40,15 54,10 70,4"
          />
        </div>
        <div className="flex items-end justify-between gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-zinc-800/60">
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Hipertensos
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              1.023
            </p>
          </div>
          <Sparkline
            color="#ec4d23"
            points="2,22 14,18 26,22 40,12 54,10 70,4"
          />
        </div>
      </div>

      <ul className="space-y-2.5">
        {PATIENTS.map(({ name, pa, risk }) => {
          const { cls, Icon } = RISK_STYLE[risk];

          return (
            <li
              key={name}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 dark:border-zinc-800"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  {name}
                </p>
                <p className="text-xs tabular-nums text-slate-500 dark:text-zinc-400">
                  PA {pa} mmHg
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
              >
                <Icon className="size-3.5" strokeWidth={2.25} />
                {risk}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const Presentation = () => {
  return (
    <section className="relative">
      {/* Hero */}
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24">
        <div>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
            Atenção Primária · e-SUS APS
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.08] tracking-[-0.02em] text-slate-900 sm:text-5xl lg:text-[3.5rem] dark:text-zinc-50">
            Cuidado cardiovascular que{" "}
            <span className="text-brand">encontra</span> quem precisa.
          </h1>

          <p className="mt-5 max-w-md text-base text-slate-600 sm:text-[17px] dark:text-zinc-400">
            Rastreamento de hipertensão e diabetes para equipes da APS.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[15px] font-semibold text-white shadow-md shadow-brand/25 transition-all hover:bg-[#d9431b] hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98]"
              href="/auth/login/profissional"
            >
              Acessar como Profissional
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-[15px] font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              href="/auth/login/paciente"
            >
              Acessar como Paciente
            </Link>
          </div>
        </div>

        <DashboardPreview />
      </div>

      {/* Destaques */}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-8 sm:grid-cols-3 sm:px-8">
        {HIGHLIGHTS.map(({ Icon, title, desc, tone }) => (
          <div key={title}>
            <div
              className={`mb-5 flex size-10 items-center justify-center rounded-full ${tone}`}
            >
              <Icon className="size-[18px]" strokeWidth={2} />
            </div>
            <h3 className="font-display text-[17px] font-semibold text-slate-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
