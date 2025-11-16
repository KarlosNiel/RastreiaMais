"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { BellAlertIcon, ChartBarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";

import { apiGet, apiPatch } from "@/lib/api";
import { getProfissionalKpis, KPI_ICONS } from "@/lib/profissional-kpis";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AgendaTable, type AgendaRow } from "@/components/profissional/AgendaTable";
import { StatusChip } from "@/components/ui/StatusChip";
import ProfessionalAppointmentDetailsModal from "@/components/profissional/ProfessionalAppointmentDetailsModal";
import CreateAlertModal from "@/components/gestor/CreateAlertModal";
import { useAlertsQuery } from "@/lib/hooks/alerts/useAlertsQuery";

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

const mapRiskToChip = (t?: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : (t ?? "safe");

/* ======================
   🔹 Página Principal
====================== */
export default function ProfissionalPage() {
  const [KPIS, setKPIS] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AgendaRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: alerts, isLoading: isLoadingAlerts } = useAlertsQuery();

  const formatCpf = (cpf?: string) => {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

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
      if (resp && typeof resp === "object" && "results" in resp && Array.isArray((resp as any).results)) {
        return (resp as any).results as AppointmentResponse[];
      }
      return [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  /* ========== Mutation para atualizar status ========== */
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiPatch(`/api/v1/appointments/appointments/${id}/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar o status do agendamento");
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
      status: a.status || "ativo",
    })) ?? [];

  /* ========== Handlers de ações ========== */
  const handleAction = (action: "done" | "delete" | "open", row: AgendaRow) => {
    switch (action) {
      case "done":
        if (confirm(`Confirma finalizar o agendamento de ${row.paciente}?`)) {
          updateStatusMutation.mutate({ id: row.id, status: "finalizado" });
        }
        break;
      case "delete":
        if (confirm(`Confirma cancelar o agendamento de ${row.paciente}?`)) {
          updateStatusMutation.mutate({ id: row.id, status: "cancelado" });
        }
        break;
      case "open":
        setSelectedAppointment(row);
        setIsModalOpen(true);
        break;
    }
  };

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
        <div>
          <nav aria-label="Ações" className="flex items-center gap-2">
            <Button
              as={Link}
              href="/pacientes"
              color="primary"
              variant="solid"
              radius="lg"
              size="md"
              className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
            >
              Lista de Pacientes
            </Button>

            <Button
              as={Link}
              href="/pacientes/novo"
              color="primary"
              variant="solid"
              radius="lg"
              size="md"
              className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
            >
              Novo Registro
            </Button>
          </nav>
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

        {/* Alertas dos Pacientes */}
        <section className="mt-4 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-transparent dark:border-gray-800 p-4 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellAlertIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Alerta dos Pacientes
              </h2>
            </div>
            <Button
              onPress={() => {
                setSelectedAlert(null);
                setIsAlertModalOpen(true);
              }}
              variant="flat"
              size="sm"
              aria-label="Adicionar alerta"
              radius="lg"
              className="text-md text-orange-600 bg-transparent border border-orange-600 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              +
            </Button>
          </div>

          <CreateAlertModal
            open={isAlertModalOpen}
            onOpenChange={setIsAlertModalOpen}
            alertData={selectedAlert}
          />

          {isLoadingAlerts ? (
            <div className="flex justify-center py-8">
              <Spinner color="warning" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="max-h-70 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <ul className="space-y-3">
                {alerts.map((a, i) => (
                  <li
                    onClick={() => {
                      setSelectedAlert(a);
                      setIsAlertModalOpen(true);
                    }}
                    key={a.id || i}
                    className={`cursor-pointer flex items-center justify-between gap-4 rounded-md p-3 shadow-sm hover:shadow-lg transition-colors delay-150 duration-300 ease-in-out ${
                      a.risk_level === "critical"
                        ? "border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/20"
                        : a.risk_level === "moderate"
                          ? "border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/20"
                          : "border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-10 place-items-center rounded-full ring-2 ${
                          a.risk_level === "critical"
                            ? "ring-rose-300"
                            : a.risk_level === "moderate"
                              ? "ring-amber-300"
                              : "ring-emerald-300"
                        } bg-white dark:bg-gray-800`}
                      >
                        <UserGroupIcon
                          className={`h-5 w-5 ${
                            a.risk_level === "critical"
                              ? "text-rose-600 dark:text-rose-400"
                              : a.risk_level === "moderate"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {a.patient?.user?.first_name ?? "—"}{" "}
                          {a.patient?.user?.last_name ?? "—"}{" "}
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatCpf(a.patient?.cpf)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                          {a.title} — {a.description}
                        </p>
                      </div>
                    </div>
                    <StatusChip size="sm" tone={mapRiskToChip(a.risk_level)}>
                      {a.risk_level === "critical"
                        ? "Crítico"
                        : a.risk_level === "moderate"
                          ? "Atenção"
                          : "Seguro"}
                    </StatusChip>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">
              Nenhum alerta encontrado.
            </p>
          )}
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
            onAction={handleAction}
          />
        )}
      </section>

      {/* Modal de Detalhes do Agendamento */}
      <ProfessionalAppointmentDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedAppointment}
      />
    </div>
  );
}