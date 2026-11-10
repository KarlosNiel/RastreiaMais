"use client";

import React, { useState } from "react";
import {
  ChartBarIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";

import { DcntPrevalenceCard } from "./DcntPrevalenceCard";
import { BloodPressureControlCard } from "./BloodPressureControlCard";
import { GlycemicControlCard } from "./GlycemicControlCard";
import { FraminghamRiskCard } from "./FraminghamRiskCard";
import { AppointmentsPerformanceCard } from "./AppointmentsPerformanceCard";
import {
  ClinicalPatientsModal,
  type PatientFilterCategory,
} from "./ClinicalPatientsModal";

import { useClinicalAnalytics } from "@/lib/hooks/profissional/useClinicalAnalytics";

export function ClinicalAnalyticsSection() {
  const [scope, setScope] = useState<"all" | "my">("all");
  const { data: analytics, isLoading, refetch } = useClinicalAnalytics(scope);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PatientFilterCategory>("all_critical");

  const handleOpenCategory = (cat: PatientFilterCategory) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const bpTotal = Math.max(
    analytics.blood_pressure.controlled +
      analytics.blood_pressure.stage_1_2 +
      analytics.blood_pressure.stage_3_critical,
    1,
  );
  const bpControlledPct = Math.round(
    (analytics.blood_pressure.controlled / bpTotal) * 100,
  );

  const dmTotal = Math.max(
    analytics.glycemia.controlled + analytics.glycemia.altered,
    1,
  );
  const dmControlledPct = Math.round(
    (analytics.glycemia.controlled / dmTotal) * 100,
  );

  return (
    <section
      aria-label="Indicadores Clínicos e Analíticos"
      className="mt-4 space-y-6"
    >
      {/* Cabeçalho da Seção Analítica */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shadow-2xs">
              <ChartBarIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Panorama Clínico &amp; Indicadores Epidemiológicos
                </h2>
                <span className="rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground px-2.5 py-0.5 text-[11px] font-bold tracking-wide">
                  APS / SUS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Monitoramento longitudinal de DCNTs, metas de controle
                pressórico/glicêmico e estratificação de risco (Framingham).
              </p>
            </div>
          </div>

          {/* Filtros e Ações */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Seletor de Escopo de População */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1 text-xs font-medium text-slate-600 dark:text-zinc-300">
              <button
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scope === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-bold dark:bg-zinc-900 dark:text-white"
                    : "hover:text-slate-900 dark:hover:text-white"
                }`}
                type="button"
                onClick={() => setScope("all")}
              >
                Toda a USF ({analytics.total_monitored_patients})
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scope === "my"
                    ? "bg-white text-slate-900 shadow-2xs font-bold dark:bg-zinc-900 dark:text-white"
                    : "hover:text-slate-900 dark:hover:text-white"
                }`}
                type="button"
                onClick={() => setScope("my")}
              >
                Meus Pacientes
              </button>
            </div>

            <Button
              isIconOnly
              aria-label="Atualizar métricas clínicas"
              className="size-9 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-white shadow-2xs"
              radius="md"
              size="sm"
              variant="bordered"
              onPress={() => refetch()}
            >
              <ArrowPathIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Barra de Metas e Alinhamento do SUS / Previne Brasil */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Meta 1: Controle Pressórico */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                Meta PA &lt; 140/90
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Previne Brasil: ≥50%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {bpControlledPct}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Meta Atingida ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {analytics.blood_pressure.controlled} de {bpTotal} hipertensos
              controlados
            </p>
          </div>

          {/* Meta 2: Controle Glicêmico */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                Meta Glicemia / HbA1c
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Meta SUS: ≥50%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {dmControlledPct}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Meta Atingida ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {analytics.glycemia.controlled} de {dmTotal} com glicemia
              controlada
            </p>
          </div>

          {/* Adesão Medicamentosa Regular */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                Adesão Farmacológica
              </span>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
                Farmácia Básica
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {analytics.conditions.adherence_rate}%
              </span>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                Alta Adesão
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Em uso regular dos anti-hipertensivos / hipoglicemiantes
            </p>
          </div>

          {/* Atenção Prioritária (Risco Crítico) - Interativo */}
          <button
            className="w-full text-left p-3.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200/70 hover:border-rose-300 dark:border-rose-900/40 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            type="button"
            onClick={() => handleOpenCategory("all_critical")}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-rose-900 dark:text-rose-200">
                Atenção Imediata
              </span>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span>Ver Pacientes</span>
                <ChevronRightIcon className="size-2.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-rose-950 dark:text-rose-100 tabular-nums">
                {analytics.blood_pressure.stage_3_critical +
                  analytics.framingham_risk.alto}
              </span>
              <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                Pacientes Críticos
              </span>
            </div>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-400 mt-1">
              {analytics.blood_pressure.stage_3_critical} HAS Estágio 3 +{" "}
              {analytics.framingham_risk.alto} Alto Risco
            </p>
          </button>
        </div>
      </div>

      {/* Grid Principal de Gráficos Analíticos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="h-80 rounded-2xl border border-slate-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900 animate-pulse p-6"
            >
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-zinc-800 rounded-md mb-4" />
              <div className="h-4 w-2/3 bg-slate-100 dark:bg-zinc-800/60 rounded-md mb-6" />
              <div className="h-32 w-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl mb-4" />
              <div className="h-8 w-full bg-slate-200/60 dark:bg-zinc-800/60 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Gráfico 1: Prevalência de DCNTs (Donut Chart SVG) */}
          <DcntPrevalenceCard
            conditions={analytics.conditions}
            totalPatients={analytics.total_monitored_patients}
            onSelectCategory={handleOpenCategory}
          />

          {/* Gráfico 2: Controle Pressórico (Histograma de Estágios SBC) */}
          <BloodPressureControlCard
            metrics={analytics.blood_pressure}
            totalHasPatients={analytics.conditions.has_count}
            onSelectCategory={handleOpenCategory}
          />

          {/* Gráfico 3: Controle Glicêmico (Radial Gauge + Modalidades) */}
          <GlycemicControlCard
            metrics={analytics.glycemia}
            totalDmPatients={analytics.conditions.dm_count}
            onSelectCategory={handleOpenCategory}
          />

          {/* Gráfico 4: Estratificação de Risco Cardiovascular de Framingham (Donut Chart SVG) */}
          <FraminghamRiskCard
            metrics={analytics.framingham_risk}
            totalPatients={analytics.total_monitored_patients}
            onSelectCategory={handleOpenCategory}
          />

          {/* Gráfico 5 / Módulo: Matriz de Prioridade Clínica & Linha de Cuidado */}
          <AppointmentsPerformanceCard
            bloodPressureCritical={analytics.blood_pressure.stage_3_critical}
            framinghamHighRisk={analytics.framingham_risk.alto}
            glycemiaAltered={analytics.glycemia.altered}
            metrics={analytics.appointments_overview}
            onSelectCategory={handleOpenCategory}
          />
        </div>
      )}

      {/* Modal Interativo de Pacientes Clínicos */}
      <ClinicalPatientsModal
        category={selectedCategory}
        isOpen={isModalOpen}
        patients={analytics.patients || []}
        onCategoryChange={setSelectedCategory}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
