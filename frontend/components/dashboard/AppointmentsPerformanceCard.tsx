"use client";

import type { AppointmentsOverviewMetrics } from "@/lib/hooks/profissional/useClinicalAnalytics";
import type { PatientFilterCategory } from "./ClinicalPatientsModal";

import React from "react";
import {
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ChevronRight } from "lucide-react";
import { Button } from "@heroui/button";
import Link from "next/link";

interface AppointmentsPerformanceCardProps {
  metrics: AppointmentsOverviewMetrics;
  bloodPressureCritical?: number;
  framinghamHighRisk?: number;
  glycemiaAltered?: number;
  onSelectCategory?: (category: PatientFilterCategory) => void;
}

export function AppointmentsPerformanceCard({
  metrics: _metrics,
  bloodPressureCritical = 1,
  framinghamHighRisk = 4,
  glycemiaAltered = 5,
  onSelectCategory,
}: AppointmentsPerformanceCardProps) {
  return (
    <article
      className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:col-span-2 lg:col-span-2"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 360px" }}
    >
      <div>
        {/* Topo do Card */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
              <ExclamationTriangleIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Matriz de Prioridade Clínica &amp; Conduta Imediata
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pacientes que requerem intervenção ativa da equipe de APS
              </p>
            </div>
          </div>

          <button
            className="rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            type="button"
            onClick={() => onSelectCategory?.("all_critical")}
          >
            <span>
              Ver Prioritários ({bloodPressureCritical + framinghamHighRisk})
            </span>
            <ChevronRight className="size-3" />
          </button>
        </div>

        {/* 3 Blocos de Alerta Crítico / Risco (Interativos) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Estágio 3 Crítico (Interativo) */}
          <button
            className="w-full text-left p-3.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200/70 hover:border-rose-300 dark:border-rose-900/40 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            type="button"
            onClick={() => onSelectCategory?.("bp_e3")}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Hipertensão E3
              </span>
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-rose-600" />
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-rose-950 dark:text-rose-100 tabular-nums">
                {bloodPressureCritical}
              </p>
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Acessar <ChevronRight className="size-3" />
              </span>
            </div>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300 mt-0.5">
              PA ≥ 180/110 mmHg. Risco de lesão aguda.
            </p>
          </button>

          {/* Alto Risco Framingham (Interativo) */}
          <button
            className="w-full text-left p-3.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-200/70 hover:border-amber-300 dark:border-amber-900/40 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            type="button"
            onClick={() => onSelectCategory?.("framingham_alto")}
          >
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
              Alto Risco Cardiovascular
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-amber-950 dark:text-amber-100 tabular-nums">
                {framinghamHighRisk}
              </p>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Acessar <ChevronRight className="size-3" />
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300 mt-0.5">
              Risco &gt; 20% em 10 anos. Exige meta rigorosa.
            </p>
          </button>

          {/* Glicemia Descompensada (Interativo) */}
          <button
            className="w-full text-left p-3.5 rounded-xl bg-orange-50/70 hover:bg-orange-100/70 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 border border-orange-200/70 hover:border-orange-300 dark:border-orange-900/40 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            type="button"
            onClick={() => onSelectCategory?.("dm_altered")}
          >
            <span className="text-xs font-bold text-orange-900 dark:text-orange-200 block">
              Glicemia Descompensada
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-orange-950 dark:text-orange-100 tabular-nums">
                {glycemiaAltered}
              </p>
              <span className="text-[11px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Acessar <ChevronRight className="size-3" />
              </span>
            </div>
            <p className="text-[11px] text-orange-800/80 dark:text-orange-300 mt-0.5">
              Necessitam de titulação ou reforço dietético.
            </p>
          </button>
        </div>

        {/* Linha de Cuidado & Ações da APS */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-zinc-100">
              Protocolo da Linha de Cuidado (Ministério da Saúde):
            </p>
            <ul className="text-slate-500 dark:text-zinc-400 space-y-0.5 text-[11px]">
              <li>
                &bull; Busca ativa via ACS para os pacientes hipertensos em
                Estágio 3.
              </li>
              <li>
                &bull; Solicitação de ECG, perfil lipídico e creatinina para o
                grupo de Alto Risco.
              </li>
              <li>
                &bull; Reavaliação de adesão farmacológica na entrega mensal de
                medicação.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              className="font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 text-xs shadow-2xs"
              radius="md"
              size="sm"
              startContent={
                <UserGroupIcon className="size-3.5 text-slate-500" />
              }
              variant="bordered"
              onPress={() => onSelectCategory?.("all_critical")}
            >
              Lista de Prioritários
            </Button>

            <Button
              as={Link}
              className="font-medium text-white bg-primary hover:bg-primary/90 text-xs shadow-2xs"
              color="primary"
              href="/profissional"
              radius="md"
              size="sm"
              startContent={<CalendarDaysIcon className="size-3.5" />}
              variant="solid"
            >
              Ver Agenda do Dia
            </Button>
          </div>
        </div>
      </div>

      {/* Rodapé: Resumo Operacional */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <span>
          Monitoramento contínuo da Estratégia Saúde da Família (e-SUS APS)
        </span>
        <span className="font-semibold text-slate-700 dark:text-zinc-300">
          Atualizado em tempo real
        </span>
      </div>
    </article>
  );
}
