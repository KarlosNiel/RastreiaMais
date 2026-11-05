"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

export const Presentation = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <BrandLogo size="xl" variant="horizontal" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-xs font-semibold tracking-wider uppercase mt-4">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Atenção Primária à Saúde • e-SUS APS
            </div>
          </div>

          <p className="text-xl sm:text-2xl text-default-600 dark:text-gray-300 mb-8 leading-relaxed">
            Plataforma completa para auxiliar equipes no gerenciamento de dados
            de pacientes com doenças crônicas não transmissíveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button
              as={Link}
              className="text-base font-semibold shadow-xs"
              color="primary"
              href="/auth/login/profissional"
              radius="md"
              size="lg"
            >
              Acessar como Profissional
            </Button>
            <Button
              as={Link}
              className="text-base font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
              href="/auth/login/paciente"
              radius="md"
              size="lg"
              variant="bordered"
            >
              Acessar como Paciente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: UserGroupIcon,
                bg: "bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/30",
                text: "Gestão de Pacientes",
                color: "text-primary",
                desc: "Acompanhe todos os dados dos pacientes em um só lugar",
              },
              {
                icon: ChartBarIcon,
                bg: "bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/30",
                text: "Monitoramento Contínuo",
                color: "text-sky-600 dark:text-sky-400",
                desc: "Registre e acompanhe dados vitais, consultas e exames",
              },
              {
                icon: ClipboardDocumentCheckIcon,
                bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30",
                text: "Dashboards e Formulários",
                color: "text-emerald-600 dark:text-emerald-400",
                desc: "Visualize e registre informações de forma eficiente",
              },
            ].map((card, i) => {
              const Icon = card.icon;

              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/70 p-6 text-center shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
                >
                  <div
                    className={`size-12 rounded-lg ${card.bg} flex items-center justify-center mb-4 mx-auto`}
                  >
                    <Icon className={`size-6 ${card.color}`} />
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-slate-900 dark:text-zinc-100">
                    {card.text}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
