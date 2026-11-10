"use client";

import type { GlycemiaMetrics } from "@/lib/hooks/profissional/useClinicalAnalytics";
import type { PatientFilterCategory } from "./ClinicalPatientsModal";

import React from "react";
import { Droplet, Syringe, Pill, Apple, ChevronRight } from "lucide-react";

interface GlycemicControlCardProps {
  metrics: GlycemiaMetrics;
  totalDmPatients: number;
  onSelectCategory?: (category: PatientFilterCategory) => void;
}

export function GlycemicControlCard({
  metrics,
  totalDmPatients,
  onSelectCategory,
}: GlycemicControlCardProps) {
  const { controlled, altered, treatment_distribution } = metrics;
  const total = Math.max(controlled + altered, 1);
  const controlledPct = Math.round((controlled / total) * 100);
  const alteredPct = Math.round((altered / total) * 100);

  const { oral, insulin, lifestyle } = treatment_distribution;
  const totalTreatments = Math.max(oral + insulin + lifestyle, 1);

  // Cálculos do Semicírculo / Radial Gauge SVG
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // 180 graus
  const strokeDashoffset =
    circumference - (Math.min(100, controlledPct) / 100) * circumference;

  return (
    <article
      className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 360px" }}
    >
      <div>
        {/* Topo do Card */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Droplet className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Controle Glicêmico (DM)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Glicemia de Jejum &amp; HbA1c (SBD / SUS)
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold tabular-nums">
            {totalDmPatients} diabéticos
          </span>
        </div>

        {/* Radial Gauge SVG + Comparativo Controlados vs Alterados */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Radial Gauge Semicircular */}
          <div className="relative shrink-0 flex flex-col items-center justify-center pt-2">
            <svg
              className="drop-shadow-xs"
              height={size / 2 + 16}
              viewBox={`0 0 ${size} ${size / 2 + 16}`}
              width={size}
            >
              {/* Arco base */}
              <path
                className="text-slate-100 dark:text-zinc-800"
                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
              {/* Arco preenchido */}
              <path
                className="transition-all duration-700 ease-out"
                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                fill="none"
                stroke="#10b981"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
            </svg>

            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
                {controlledPct}%
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                Sob Controle
              </span>
            </div>
          </div>

          {/* Cards de Comparativo */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
              <div>
                <span className="font-semibold text-emerald-900 dark:text-emerald-300 block">
                  Meta Controlada
                </span>
                <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                  HbA1c &lt; 7.0% ou Jejum &lt; 130
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-200 tabular-nums">
                  {controlled}
                </span>
                <span className="text-[10px] block text-emerald-600 dark:text-emerald-400">
                  {controlledPct}% do grupo
                </span>
              </div>
            </div>

            {/* Glicemia Alterada (Interativo) */}
            <button
              className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100 hover:border-rose-300 dark:border-rose-900/30 text-xs transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              type="button"
              onClick={() => onSelectCategory?.("dm_altered")}
            >
              <div>
                <span className="font-semibold text-rose-900 dark:text-rose-300 block">
                  Glicemia Alterada
                </span>
                <span className="text-[10px] text-rose-700/80 dark:text-rose-400">
                  Necessitam de ajuste &bull; Ver pacientes
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-right">
                <div>
                  <span className="text-base font-extrabold text-rose-800 dark:text-rose-200 tabular-nums">
                    {altered}
                  </span>
                  <span className="text-[10px] block text-rose-600 dark:text-rose-400">
                    {alteredPct}% do grupo
                  </span>
                </div>
                <ChevronRight className="size-3.5 text-rose-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>
        </div>

        {/* Gráfico de Modalidades de Tratamento */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2.5 flex items-center justify-between">
            <span>Modalidades de Manejo Clínico</span>
            <span className="text-[10px] font-normal text-slate-500">
              Total: {oral + insulin + lifestyle} intervenções
            </span>
          </p>

          <div className="space-y-2">
            {/* Medicamentoso Oral */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <Pill className="size-3.5 text-sky-500" />
                  Antidiabéticos Orais (Metformina)
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {oral}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${(oral / totalTreatments) * 100}%` }}
                />
              </div>
            </div>

            {/* Insulinoterapia (Interativo) */}
            <button
              className="w-full text-left p-1 -mx-1 rounded-lg hover:bg-purple-50/80 dark:hover:bg-purple-950/30 transition-all group cursor-pointer focus:outline-none"
              type="button"
              onClick={() => onSelectCategory?.("dm_insulin")}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1.5 group-hover:text-purple-900 transition-colors">
                  <Syringe className="size-3.5 text-purple-500" />
                  Insulinoterapia (NPH / Regular)
                </span>
                <div className="flex items-center gap-1 font-bold text-purple-900 dark:text-purple-200 tabular-nums">
                  <span>{insulin}</span>
                  <ChevronRight className="size-3 text-purple-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full group-hover:brightness-110"
                  style={{ width: `${(insulin / totalTreatments) * 100}%` }}
                />
              </div>
            </button>

            {/* Mudança de Estilo de Vida */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <Apple className="size-3.5 text-emerald-500" />
                  Dieta &amp; Estilo de Vida (MEV)
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {lifestyle}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(lifestyle / totalTreatments) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destaque Clínico: Pacientes Insulinodependentes (Interativo) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-zinc-400">
          Monitoramento de Insumos:
        </span>
        <button
          className="font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 hover:underline cursor-pointer flex items-center gap-1"
          type="button"
          onClick={() => onSelectCategory?.("dm_insulin")}
        >
          <span>{insulin} paciente(s) com fitas &amp; glicosímetro</span>
          <ChevronRight className="size-3" />
        </button>
      </div>
    </article>
  );
}
