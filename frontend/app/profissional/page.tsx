"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { BellAlertIcon, ChartBarIcon } from "@heroicons/react/24/outline";

import { apiGet } from "@/lib/api";
import { getProfissionalKpis, KPI_ICONS } from "@/lib/profissional-kpis";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AgendaTable, type AgendaRow } from "@/components/profissional/AgendaTable";
import { StatusChip } from "@/components/ui/StatusChip";

/* ======================
   🔹 Tipos e Funções Auxiliares
====================== */
type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";

interface AppointmentResponse {
  id: number;
  patient: {
    id: number;
    conditions: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  professional: number;
  scheduled_datetime: string;
  local?: {
    name?: string;
  } | null;
  risk_level: "Seguro" | "Moderado" | "Crítico";
  description?: string;
  type: string;
  status?: string;
}

function mapRiskLevel(level: string): RiskTone {
  switch (level) {
    case "Moderado":
      return "moderate";
    case "Crítico":
      return "critical";
    default:
      return "safe";
  }
}

const mapRiskToChip = (t: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : t;

/* ======================
   🔹 Página Principal
====================== */
export default function ProfissionalPage() {
  const [KPIS, setKPIS] = useState<any[]>([]);

  useEffect(() => {
    getProfissionalKpis().then(setKPIS);
  }, []);

  /* ========== Busca dos agendamentos ========== */
  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<AppointmentResponse[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet<AppointmentResponse[]>("/api/v1/appointments/appointments/");
      if (Array.isArray(resp)) return resp;
      // Handle paginated responses that contain a `results` array
      if (resp && typeof resp === "object" && "results" in resp && Array.isArray((resp as any).results)) {
        return (resp as any).results as AppointmentResponse[];
      }
      return [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false; // evita retry em erro 401
      return failureCount < 3;
    },
  });

  /* ========== Mapeamento p/ tabela ========== */
  const AGENDA_ROWS: AgendaRow[] =
    appointments?.map((a) => ({
      id: String(a.id),
      paciente:
        `${a.patient?.user?.first_name ?? ""} ${a.patient?.user?.last_name ?? ""}`.trim() ||
        "Desconhecido",
      hora: new Date(a.scheduled_datetime).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      local: a.local?.name ?? "UBS",
      risco: mapRiskLevel(a.risk_level),
      condicao: a.patient.conditions ?? "—",
      docMasked: "",
    })) ?? [];

  /* ========== Renderização ========== */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-2 pt-8 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl dark:text-white">
            Dashboard do Profissional
          </h1>
          <p className="mt-1 text-sm text-foreground/60 dark:text-white/80">
            Visão geral da APS •{" "}
            <span className="font-medium">Microárea: Jardim Magnólia</span>
          </p>
        </div>
      </header>

      {/* KPIs e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPIs */}
        <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KPIS.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              accent={kpi.accent}
              icon={(KPI_ICONS as Record<string, React.ReactNode>)[kpi.key]}
            />
          ))}
        </section>

        {/* Alertas Recentes */}
        <section className="mt-4 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-transparent dark:border-gray-800 p-4 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellAlertIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Alertas Recentes
              </h2>
            </div>
            <Button
              variant="flat"
              size="sm"
              radius="lg"
              className="text-md text-orange-600 bg-transparent border border-orange-600 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              +
            </Button>
          </div>

          <ul className="space-y-3">
            {[
              { nome: "Maria C.", id: "****4321", cond: "HAS", quando: "30 min", tone: "critical" as RiskTone },
              { nome: "José A.", id: "****1234", cond: "HAS", quando: "1 h", tone: "safe" as RiskTone },
              { nome: "Ana L.", id: "****5678", cond: "HAS/DM", quando: "2 h", tone: "moderate" as RiskTone },
              { nome: "Clara M.", id: "****4312", cond: "HAS", quando: "4 h", tone: "safe" as RiskTone },
            ].map((a, i) => (
              <li
                key={i}
                className={`flex items-center justify-between gap-4 rounded-md p-3 shadow-sm hover:shadow-lg transition-all duration-300 ${
                  a.tone === "critical"
                    ? "border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/20"
                    : a.tone === "moderate"
                    ? "border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/20"
                    : "border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid size-10 place-items-center rounded-full ring-2 ${
                      a.tone === "critical"
                        ? "ring-rose-300"
                        : a.tone === "moderate"
                        ? "ring-amber-300"
                        : "ring-emerald-300"
                    } bg-white dark:bg-gray-800`}
                  >
                    <ChartBarIcon
                      className={`h-5 w-5 ${
                        a.tone === "critical"
                          ? "text-rose-600 dark:text-rose-400"
                          : a.tone === "moderate"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {a.nome}{" "}
                      <span className="text-gray-500 dark:text-gray-400">{a.id}</span>
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Condição: {a.cond} · Atualizado: {a.quando}
                    </p>
                  </div>
                </div>
                <StatusChip size="sm" tone={mapRiskToChip(a.tone)}>
                  {a.tone === "critical"
                    ? "Crítico"
                    : a.tone === "moderate"
                    ? "Atenção"
                    : "Seguro"}
                </StatusChip>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Agenda */}
      <section className="mt-6 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-transparent dark:border-gray-800 p-4 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Agenda
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">
            Carregando agendamentos...
          </div>
        ) : isError ? (
          <div className="p-6 text-red-600 dark:text-red-400">
            Erro ao carregar agendamentos.
          </div>
        ) : (
          <AgendaTable
            rows={AGENDA_ROWS}
            enableToolbar
            initialPage={1}
            initialRowsPerPage={8}
          />
        )}
      </section>
    </div>
  );
}
