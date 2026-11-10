"use client";

import type { FraminghamMetrics } from "@/lib/hooks/profissional/useClinicalAnalytics";
import type { PatientFilterCategory } from "./ClinicalPatientsModal";

import React from "react";
import { ShieldAlert, ChevronRight, HeartPulse } from "lucide-react";

interface FraminghamRiskCardProps {
  metrics: FraminghamMetrics;
  totalPatients: number;
  onSelectCategory?: (category: PatientFilterCategory) => void;
}

export function FraminghamRiskCard({
  metrics,
  totalPatients,
  onSelectCategory,
}: FraminghamRiskCardProps) {
  const { baixo, moderado, alto } = metrics;
  const totalAvaliado = Math.max(baixo + moderado + alto, 1);

  const baixoPct = Math.round((baixo / totalAvaliado) * 100);
  const moderadoPct = Math.round((moderado / totalAvaliado) * 100);
  const altoPct = Math.round((alto / totalAvaliado) * 100);

  // Dados para o Donut Chart de Risco Global
  const donutData = [
    {
      label: "Alto Risco (>20%)",
      value: alto,
      color: "#e11d48",
      category: "framingham_alto" as PatientFilterCategory,
    },
    {
      label: "Risco Moderado (10-20%)",
      value: moderado,
      color: "#f59e0b",
      category: "framingham_moderado" as PatientFilterCategory,
    },
    {
      label: "Baixo Risco (<10%)",
      value: baixo,
      color: "#10b981",
      category: null,
    },
  ];

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
            <div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Risco Cardiovascular (Framingham)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Estratificação de Evento Coronariano em 10 Anos
              </p>
            </div>
          </div>

          <span className="rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold tabular-nums">
            {baixo + moderado + alto} avaliados
          </span>
        </div>

        {/* Gráfico Donut SVG + Proporções */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
          {/* Donut Interativo */}
          <button
            className="relative shrink-0 flex items-center justify-center group cursor-pointer focus:outline-none"
            title="Clique para ver os pacientes de Alto Risco"
            type="button"
            onClick={() => onSelectCategory?.("framingham_alto")}
          >
            <svg
              className="rotate-[-90deg] drop-shadow-xs group-hover:scale-105 transition-transform"
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              width={size}
            >
              <circle
                className="text-slate-100 dark:text-zinc-800"
                cx={size / 2}
                cy={size / 2}
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
              {donutData.map((item, idx) => {
                const sliceLength =
                  (item.value / totalAvaliado) * circumference;
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

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none group-hover:text-rose-600 transition-colors">
                {alto}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mt-1">
                Alto Risco
              </span>
            </div>
          </button>

          {/* Estratos de Risco com Botões Interativos */}
          <div className="flex-1 w-full space-y-2">
            {/* Alto Risco (Interativo) */}
            <button
              className="w-full text-left p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100 hover:border-rose-300 dark:border-rose-900/30 text-xs transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              type="button"
              onClick={() => onSelectCategory?.("framingham_alto")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500" />
                  Alto Risco (&gt;20%)
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-rose-900 dark:text-rose-200 tabular-nums">
                    {alto} ({altoPct}%)
                  </span>
                  <ChevronRight className="size-3 text-rose-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <span className="text-[10px] text-rose-700/80 dark:text-rose-400 block">
                Meta estrita: PA &lt; 130/80 + Estatina &bull; Ver pacientes
              </span>
            </button>

            {/* Risco Moderado (Interativo) */}
            <button
              className="w-full text-left p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-100 hover:border-amber-300 dark:border-amber-900/30 text-xs transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              type="button"
              onClick={() => onSelectCategory?.("framingham_moderado")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Moderado (10% - 20%)
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-900 dark:text-amber-200 tabular-nums">
                    {moderado} ({moderadoPct}%)
                  </span>
                  <ChevronRight className="size-3 text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400 block">
                Meta PA &lt; 140/90 + Rastreio LOA &bull; Ver pacientes
              </span>
            </button>

            {/* Baixo Risco */}
            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Baixo Risco (&lt;10%)
                </span>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 tabular-nums">
                  {baixo} ({baixoPct}%)
                </span>
              </div>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 block">
                Acompanhamento anual e promoção de MEV
              </span>
            </div>
          </div>
        </div>

        {/* Diretriz APS para Manejo de Alto Risco */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
          <p className="font-semibold text-slate-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
            <HeartPulse className="size-4 text-primary" />
            Conduta Clínica Recomendada:
          </p>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
            Pacientes com Framingham &gt; 20% exigem consultas bimestrais com
            equipe multiprofissional, solicitação de ECG, creatinina e rastreio
            de lesão de órgão-alvo.
          </p>
        </div>
      </div>

      {/* Rodapé: Cobertura de Avaliação */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-zinc-400">
          Cobertura da Estratificação:
        </span>
        <span className="font-bold text-slate-800 dark:text-zinc-200">
          {Math.round(
            ((baixo + moderado + alto) / Math.max(totalPatients, 1)) * 100,
          )}
          % da microárea
        </span>
      </div>
    </article>
  );
}
