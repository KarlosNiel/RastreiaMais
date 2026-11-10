"use client";

import {
  CalendarDaysIcon,
  ChartBarSquareIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useMemo } from "react";

import { ClinicalAnalyticsSection } from "@/components/dashboard/ClinicalAnalyticsSection";

export default function ProfessionalDashboardPage() {
  const dateFormatted = useMemo(() => {
    const d = new Date();
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Cabeçalho do Módulo de Dashboard */}
      <header className="flex flex-col gap-4 pt-8 pb-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shadow-2xs">
              <ChartBarSquareIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Dashboard Clínico &amp; Epidemiológico
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {dateFormatted} &bull;{" "}
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Microárea: Jardim Magnólia
            </span>
          </p>
        </div>

        <nav
          aria-label="Ações do dashboard"
          className="flex items-center gap-2.5"
        >
          <Button
            as={Link}
            className="font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-2xs"
            href="/profissional"
            radius="md"
            size="md"
            startContent={
              <CalendarDaysIcon className="size-4 text-slate-500 dark:text-zinc-400" />
            }
            variant="bordered"
          >
            Ver Atendimentos
          </Button>

          <Button
            as={Link}
            className="font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-2xs"
            href="/pacientes/novo"
            radius="md"
            size="md"
            startContent={
              <UserPlusIcon className="size-4 text-slate-500 dark:text-zinc-400" />
            }
            variant="bordered"
          >
            Novo Paciente
          </Button>
        </nav>
      </header>

      {/* Panorama Analítico Completo */}
      <div className="mt-2">
        <ClinicalAnalyticsSection />
      </div>
    </div>
  );
}
