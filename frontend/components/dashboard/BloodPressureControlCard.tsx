"use client";

import type { BloodPressureMetrics } from "@/lib/hooks/profissional/useClinicalAnalytics";
import type { PatientFilterCategory } from "./ClinicalPatientsModal";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface BloodPressureControlCardProps {
  metrics: BloodPressureMetrics;
  totalHasPatients: number;
  onSelectCategory?: (category: PatientFilterCategory) => void;
}

export function BloodPressureControlCard({
  metrics,
  totalHasPatients: _totalHasPatients,
  onSelectCategory,
}: BloodPressureControlCardProps) {
  const { controlled, stage_1_2, stage_3_critical, distribution } = metrics;
  const total = Math.max(controlled + stage_1_2 + stage_3_critical, 1);
  const controlledPct = Math.round((controlled / total) * 100);
  const uncontrolled = stage_1_2 + stage_3_critical;
  const uncontrolledPct = Math.round((uncontrolled / total) * 100);

  // 5 Estágios da Diretriz Brasileira de Hipertensão (SBC)
  const stages: Array<{
    id: "normal" | "pre" | "e1" | "e2" | "e3";
    categoryKey: PatientFilterCategory;
    name: string;
    range: string;
    count: number;
    pct: number;
    barColor: string;
    textColor: string;
    pillBg: string;
    isTarget: boolean;
    isCritical?: boolean;
  }> = [
    {
      id: "normal",
      categoryKey: "bp_normal",
      name: "Ótima / Normal",
      range: "< 120/80 mmHg",
      count: distribution.NORMAL,
      pct: Math.round((distribution.NORMAL / total) * 100),
      barColor: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-400",
      pillBg:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      isTarget: true,
    },
    {
      id: "pre",
      categoryKey: "bp_pre",
      name: "Pré-Hipertensão",
      range: "120-139 / 80-89 mmHg",
      count: distribution.PRE_HIPERTENSO,
      pct: Math.round((distribution.PRE_HIPERTENSO / total) * 100),
      barColor: "bg-teal-500",
      textColor: "text-teal-700 dark:text-teal-400",
      pillBg: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
      isTarget: true,
    },
    {
      id: "e1",
      categoryKey: "bp_e1",
      name: "Hipertensão Estágio 1",
      range: "140-159 / 90-99 mmHg",
      count: distribution.HIPERTENSO_E1,
      pct: Math.round((distribution.HIPERTENSO_E1 / total) * 100),
      barColor: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-400",
      pillBg:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      isTarget: false,
    },
    {
      id: "e2",
      categoryKey: "bp_e2",
      name: "Hipertensão Estágio 2",
      range: "160-179 / 100-109 mmHg",
      count: distribution.HIPERTENSO_E2,
      pct: Math.round((distribution.HIPERTENSO_E2 / total) * 100),
      barColor: "bg-orange-500",
      textColor: "text-orange-700 dark:text-orange-400",
      pillBg:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
      isTarget: false,
    },
    {
      id: "e3",
      categoryKey: "bp_e3",
      name: "Hipertensão Estágio 3 Crítico",
      range: "≥ 180 / ≥ 110 mmHg",
      count: distribution.HIPERTENSO_E3,
      pct: Math.round((distribution.HIPERTENSO_E3 / total) * 100),
      barColor: "bg-rose-600",
      textColor: "text-rose-700 dark:text-rose-400",
      pillBg:
        "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
      isTarget: false,
      isCritical: true,
    },
  ];

  const maxStageCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <article
      className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 360px" }}
    >
      <div>
        {/* Topo do Card */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <Activity className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Controle Pressórico (PA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Diretriz Brasileira de Hipertensão (SBC / SUS)
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              controlledPct >= 50
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            {controlledPct}% sob controle
          </span>
        </div>

        {/* Macro Comparativo: Zona de Meta vs Fora da Meta */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Zona Sob Controle (Interativo) */}
          <button
            className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-left transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            type="button"
            onClick={() => onSelectCategory?.("bp_normal")}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Meta (&lt;140/90)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {controlledPct}%
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100 tabular-nums">
                {controlled}{" "}
                <span className="text-[11px] font-normal text-emerald-700/80 dark:text-emerald-400">
                  pacientes
                </span>
              </p>
              <ChevronRight className="size-3.5 text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Fora da Meta (Interativo) */}
          <button
            className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 text-left transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            type="button"
            onClick={() => onSelectCategory?.("bp_uncontrolled")}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-amber-500" />
                Alterada (≥140/90)
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                {uncontrolledPct}%
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-lg font-extrabold text-amber-950 dark:text-amber-100 tabular-nums">
                {uncontrolled}{" "}
                <span className="text-[11px] font-normal text-amber-700/80 dark:text-amber-400">
                  pacientes
                </span>
              </p>
              <ChevronRight className="size-3.5 text-amber-600 dark:text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        </div>

        {/* Régua Horizontal de Estágios Pressóricos (Histograma Horizontal Interativo) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
            <span>Estratificação Detalhada (SBC)</span>
            <span>Clique para listar</span>
          </div>

          {stages.map((stage, idx) => {
            const barWidth = Math.max(
              Math.round((stage.count / maxStageCount) * 100),
              6,
            );

            return (
              <div key={stage.id} className="space-y-1">
                {/* Linha divisória de Meta Clínica Previne Brasil */}
                {idx === 2 && (
                  <div className="pt-1.5 pb-1 flex items-center gap-2">
                    <div className="h-px flex-1 bg-dashed border-t border-dashed border-emerald-400 dark:border-emerald-500/50" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      Corte da Meta APS (&lt; 140/90 mmHg)
                    </span>
                    <div className="h-px flex-1 bg-dashed border-t border-dashed border-emerald-400 dark:border-emerald-500/50" />
                  </div>
                )}

                <button
                  className="w-full text-left p-1.5 -mx-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="button"
                  onClick={() => onSelectCategory?.(stage.categoryKey)}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`size-2.5 rounded-full shrink-0 ${stage.barColor} ${
                          stage.isCritical ? "animate-ping" : ""
                        }`}
                      />
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate group-hover:text-primary transition-colors">
                        {stage.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
                        ({stage.range})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 font-bold tabular-nums">
                      <span className="text-slate-900 dark:text-zinc-100">
                        {stage.count}
                      </span>
                      <span className="text-[11px] font-normal text-slate-400 dark:text-zinc-500">
                        ({stage.pct}%)
                      </span>
                      <ChevronRight className="size-3 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* Barra de Progresso Horizontal Calibrada */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full ${stage.barColor} rounded-full transition-all duration-500 group-hover:brightness-110`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerta de Ação Clínica: Estágio 3 Crítico (Interativo) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
        {stage_3_critical > 0 ? (
          <button
            className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200/70 hover:border-rose-300 dark:border-rose-900/40 text-xs transition-all group cursor-pointer"
            type="button"
            onClick={() => onSelectCategory?.("bp_e3")}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex size-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-rose-600" />
              </span>
              <div className="truncate">
                <span className="font-bold text-rose-900 dark:text-rose-200 block">
                  Estágio 3 Crítico (≥180/110 mmHg):
                </span>
                <span className="text-[10px] text-rose-700 dark:text-rose-300">
                  Risco agudo de lesão em órgão-alvo &bull; Clique para abrir
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-rose-800 dark:text-rose-200 bg-white dark:bg-rose-900/60 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800 shrink-0 tabular-nums">
              <span>{stage_3_critical} prioritário</span>
              <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            <span>Nenhum hipertenso em estágio crítico 3 no período.</span>
          </div>
        )}
      </div>
    </article>
  );
}
