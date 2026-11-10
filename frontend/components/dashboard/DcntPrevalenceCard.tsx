"use client";

import type { ConditionsMetrics } from "@/lib/hooks/profissional/useClinicalAnalytics";
import type { PatientFilterCategory } from "./ClinicalPatientsModal";

import React from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { Pill, ChevronRight } from "lucide-react";

interface DcntPrevalenceCardProps {
  conditions: ConditionsMetrics;
  totalPatients: number;
  onSelectCategory?: (category: PatientFilterCategory) => void;
}

export function DcntPrevalenceCard({
  conditions,
  totalPatients,
  onSelectCategory,
}: DcntPrevalenceCardProps) {
  const {
    has_count,
    dm_count,
    both_count,
    has_only,
    dm_only,
    total_with_dcnt,
    adherence_rate,
  } = conditions;

  const total = totalPatients || 1;
  const dcntTotal = Math.max(total_with_dcnt, 1);
  const prevalencePct = Math.round((total_with_dcnt / total) * 100);

  // Dados para o Donut Chart SVG
  const donutData = [
    { label: "Apenas HAS", value: has_only, color: "#0284c7" }, // Sky 600
    { label: "HAS + Diabetes", value: both_count, color: "#8b5cf6" }, // Violet 500
    { label: "Apenas Diabetes", value: dm_only, color: "#10b981" }, // Emerald 500
  ];

  // Cálculos do Donut SVG
  const size = 130;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <article
      className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 360px" }}
    >
      <div>
        {/* Topo do Card */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <HeartIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Prevalência de DCNTs
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Hipertensão (HAS) &amp; Diabetes Mellitus (DM)
              </p>
            </div>
          </div>

          <span className="rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold tabular-nums">
            {prevalencePct}% monitorados
          </span>
        </div>

        {/* Gráfico Donut SVG + Métricas Centrais */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              className="rotate-[-90deg] drop-shadow-xs"
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              width={size}
            >
              {/* Círculo de fundo */}
              <circle
                className="text-slate-100 dark:text-zinc-800"
                cx={size / 2}
                cy={size / 2}
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
              {/* Arcos de dados */}
              {donutData.map((item, idx) => {
                const sliceLength = (item.value / dcntTotal) * circumference;
                const offset = -accumulated;

                accumulated += sliceLength;

                if (item.value === 0) return null;

                return (
                  <circle
                    key={idx}
                    className="transition-all duration-700 ease-out"
                    cx={size / 2}
                    cy={size / 2}
                    fill="transparent"
                    r={radius}
                    stroke={item.color}
                    strokeDasharray={`${sliceLength} ${circumference - sliceLength}`}
                    strokeDashoffset={offset}
                    strokeWidth={strokeWidth}
                  />
                );
              })}
            </svg>

            {/* Texto central do Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
                {total_with_dcnt}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-1">
                de {totalPatients} pac.
              </span>
            </div>
          </div>

          {/* Legenda Detalhada Interativa */}
          <div className="flex-1 w-full space-y-2">
            {/* Apenas HAS */}
            <button
              className="w-full flex items-center justify-between text-xs p-2 rounded-lg bg-sky-50/60 hover:bg-sky-100/70 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 border border-sky-100/60 hover:border-sky-300 dark:border-sky-900/30 transition-all group cursor-pointer focus:outline-none"
              type="button"
              onClick={() => onSelectCategory?.("has_only")}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-zinc-300 group-hover:text-sky-900 dark:group-hover:text-sky-200">
                  Apenas HAS
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                <span>{has_only}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({Math.round((has_only / dcntTotal) * 100)}%)
                </span>
                <ChevronRight className="size-3 text-sky-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* HAS + Diabetes (Multimorbidade) */}
            <button
              className="w-full flex items-center justify-between text-xs p-2 rounded-lg bg-purple-50/60 hover:bg-purple-100/70 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 border border-purple-100/60 hover:border-purple-300 dark:border-purple-900/30 transition-all group cursor-pointer focus:outline-none"
              type="button"
              onClick={() => onSelectCategory?.("comorbidity")}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="font-semibold text-purple-900 dark:text-purple-300">
                  HAS + Diabetes
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 tabular-nums">
                <span>{both_count}</span>
                <span className="text-[11px] font-normal text-purple-700/80 dark:text-purple-400">
                  ({Math.round((both_count / dcntTotal) * 100)}%)
                </span>
                <ChevronRight className="size-3 text-purple-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Apenas Diabetes */}
            <button
              className="w-full flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100/60 hover:border-emerald-300 dark:border-emerald-900/30 transition-all group cursor-pointer focus:outline-none"
              type="button"
              onClick={() => onSelectCategory?.("dm_only")}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-zinc-300 group-hover:text-emerald-900 dark:group-hover:text-emerald-200">
                  Apenas DM
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                <span>{dm_only}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({Math.round((dm_only / dcntTotal) * 100)}%)
                </span>
                <ChevronRight className="size-3 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>
        </div>

        {/* Resumo Absoluto das Condições */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">
              Total HAS
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {has_count}
            </span>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 block">
              {Math.round((has_count / total) * 100)}% microárea
            </span>
          </div>

          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">
              Total DM
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {dm_count}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
              {Math.round((dm_count / total) * 100)}% microárea
            </span>
          </div>

          {/* Multimorbidade Interativo */}
          <button
            className="text-center p-2 rounded-lg bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 border border-purple-100 hover:border-purple-300 dark:border-purple-900/40 transition-all group cursor-pointer focus:outline-none"
            type="button"
            onClick={() => onSelectCategory?.("comorbidity")}
          >
            <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-semibold">
              Multimorbidade
            </span>
            <span className="text-base font-bold text-purple-900 dark:text-purple-200 tabular-nums group-hover:scale-105 transition-transform inline-block">
              {both_count}
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 block">
              {Math.round((both_count / total) * 100)}% conjunto
            </span>
          </button>
        </div>
      </div>

      {/* Rodapé: Adesão Medicamentosa Regular */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
          <Pill className="size-3.5 text-emerald-500" />
          <span>Adesão Farmacológica:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${adherence_rate}%` }}
            />
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {adherence_rate}%
          </span>
        </div>
      </div>
    </article>
  );
}
