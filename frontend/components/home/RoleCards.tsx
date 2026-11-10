"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, Stethoscope, User } from "lucide-react";

const PROFILES = [
  {
    href: "/auth/login/profissional",
    Icon: Stethoscope,
    iconTone: "bg-orange-100 text-brand dark:bg-orange-500/15",
    title: "Profissional de Saúde",
    items: [
      "Gestão completa de pacientes",
      "Relatórios e indicadores de APS",
      "Histórico de consultas e exames",
    ],
    cta: "Entrar como profissional",
  },
  {
    href: "/auth/login/paciente",
    Icon: User,
    iconTone:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    title: "Portal do Paciente",
    items: [
      "Histórico de saúde completo",
      "Visualizar consultas e exames",
      "Acompanhar medicações prescritas",
    ],
    cta: "Entrar como paciente",
  },
];

export const RoleCards = () => {
  return (
    <section className="scroll-mt-20 pb-28 pt-8" id="entrar">
      <div className="mx-auto max-w-[44rem] px-5 sm:px-8">
        <h2 className="mb-10 text-center font-display text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-[2rem] dark:text-zinc-50">
          Escolha seu Perfil de Acesso
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {PROFILES.map(({ href, Icon, iconTone, title, items, cta }) => (
            <Link
              key={title}
              className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              href={href}
            >
              <div
                className={`mb-5 flex size-11 items-center justify-center rounded-full ${iconTone}`}
              >
                <Icon className="size-5" strokeWidth={2} />
              </div>

              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-zinc-100">
                {title}
              </h3>

              <ul className="mb-6 mt-3 space-y-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400"
                  >
                    <CircleCheck
                      className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                {cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
