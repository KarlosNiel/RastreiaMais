"use client";

import {
  BellAlertIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { KpiCard } from "@/components/dashboard/KpiCard";
import CreateAlertModal from "@/components/gestor/CreateAlertModal";
import {
  AgendaTable,
  type AgendaRow,
} from "@/components/profissional/AgendaTable";
import ProfessionalAppointmentDetailsModal from "@/components/profissional/ProfessionalAppointmentDetailsModal";
import { StatusChip } from "@/components/ui/StatusChip";
import { apiGet, apiPatch } from "@/lib/api";
import { useAlertsQuery } from "@/lib/hooks/alerts/useAlertsQuery";
import { useDeleteAlert } from "@/lib/hooks/alerts/useDeleteAlert";
import { useProfissionalKpis } from "@/lib/hooks/profissional/useProfissionalKpis";
import { KPI_ICONS } from "@/lib/profissional-kpis";
import ConfirmModal from "@/components/profissional/ConfirmModal";

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

export default function ProfissionalPage() {
  const [confirmData, setConfirmData] = useState<{
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    tone?: "default" | "danger";
    onConfirm: () => void;
  }>({
    open: false,
    title: "Confirmar ação",
    message: "",
    confirmText: "Confirmar",
    tone: "default",
    onConfirm: () => {},
  });
  const { data: KPIS } = useProfissionalKpis();
  const [selectedAppointment, setSelectedAppointment] =
    useState<AgendaRow | null>(null);
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

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<AppointmentResponse[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet<AppointmentResponse[]>(
        "/api/v1/appointments/appointments/",
      );

      if (Array.isArray(resp)) return resp;
      if (
        resp &&
        typeof resp === "object" &&
        "results" in resp &&
        Array.isArray((resp as any).results)
      ) {
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiPatch(`/api/v1/appointments/appointments/${id}/`, {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar o status do agendamento");
    },
  });

  const deleteAlertMutation = useDeleteAlert();

  const handleDeleteAlert = async (alertId: number) => {
    if (!confirm("Tem certeza que deseja excluir este alerta?")) return;

    try {
      await deleteAlertMutation.mutateAsync(alertId);
      setIsAlertModalOpen(false);
      setSelectedAlert(null);
    } catch (err) {
      console.error("Erro ao deletar alerta:", err);
    }
  };

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
      type: a.type ?? "-",
      risco: mapRiskLevel(a.risk_level),
      condicao: a.patient.conditions ?? "—",
      docMasked: "",
      status: a.status || "ativo",
    })) ?? [];

  const handleAction = (action: "done" | "delete" | "open", row: AgendaRow) => {
    if (action === "open") {
      setSelectedAppointment(row);
      setIsModalOpen(true);

      return;
    }

    const config = {
      done: {
        title: "Finalizar agendamento",
        msg: `Deseja marcar o agendamento de ${row.paciente} como finalizado?`,
        confirmText: "Finalizar",
        tone: "default" as const,
        status: "finalizado",
      },
      delete: {
        title: "Cancelar agendamento",
        msg: `Tem certeza que deseja cancelar o agendamento de ${row.paciente}? O registro permanecerá no sistema com o status "Cancelado".`,
        confirmText: "Cancelar agendamento",
        tone: "danger" as const,
        status: "cancelado",
      },
    }[action];

    setConfirmData({
      open: true,
      title: config.title,
      message: config.msg,
      confirmText: config.confirmText,
      tone: config.tone,
      onConfirm: () => {
        updateStatusMutation.mutate({
          id: row.id,
          status: config.status,
        });
        setConfirmData((p) => ({ ...p, open: false }));
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 pt-8 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Dashboard do Profissional
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Visão geral da APS &bull;{" "}
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Microárea: Jardim Magnólia
            </span>
          </p>
        </div>
        <div>
          <nav aria-label="Ações" className="flex items-center gap-3">
            <Button
              as={Link}
              className="font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-xs"
              href="/pacientes"
              radius="md"
              size="md"
              variant="bordered"
            >
              Lista de Pacientes
            </Button>

            <Button
              as={Link}
              className="font-medium text-white bg-primary hover:bg-primary/90 shadow-xs"
              color="primary"
              href="/pacientes/novo"
              radius="md"
              size="md"
              startContent={<PlusIcon className="size-4" strokeWidth={2.5} />}
              variant="solid"
            >
              Novo Registro
            </Button>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KPIS.map((kpi) => (
            <KpiCard
              key={kpi.key}
              accent={kpi.accent}
              delta={kpi.delta}
              icon={(KPI_ICONS as Record<string, React.ReactNode>)[kpi.key]}
              label={kpi.label}
              value={kpi.value}
            />
          ))}
        </section>

        <section className="mt-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <BellAlertIcon className="size-5 text-rose-500 dark:text-rose-400" />
                  {alerts?.some((a) => a.risk_level === "critical") && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Alerta dos Pacientes
                </h2>
                {alerts && alerts.length > 0 && (
                  <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-zinc-400">
                    {alerts.length}
                  </span>
                )}
              </div>
              <Button
                isIconOnly
                aria-label="Adicionar alerta"
                className="size-8 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                radius="md"
                size="sm"
                variant="flat"
                onPress={() => {
                  setSelectedAlert(null);
                  setIsAlertModalOpen(true);
                }}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>

            <CreateAlertModal
              alertData={selectedAlert}
              open={isAlertModalOpen}
              onOpenChange={setIsAlertModalOpen}
            />

            {isLoadingAlerts ? (
              <div className="flex justify-center py-8">
                <Spinner color="warning" />
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                <ul className="space-y-2.5">
                  {alerts
                    .slice()
                    .reverse()
                    .map((a, i) => (
                      <li key={a.id || i}>
                        <button
                          className="group w-full cursor-pointer flex items-center justify-between gap-3 rounded-lg p-3 border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-200 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 dark:hover:border-zinc-700 transition-all text-left"
                          type="button"
                          onClick={() => {
                            setSelectedAlert(a);
                            setIsAlertModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 shadow-2xs group-hover:text-slate-700 dark:group-hover:text-zinc-200">
                              <UserGroupIcon className="size-4.5" />
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                              <p className="text-sm font-medium text-slate-800 dark:text-zinc-100 truncate w-full">
                                {a.patient?.user?.first_name ?? "—"}{" "}
                                {a.patient?.user?.last_name ?? "—"}{" "}
                                <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-1">
                                  {formatCpf(a.patient?.cpf)}
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate w-full mt-0.5">
                                {a.title}{" "}
                                {a.description ? `— ${a.description}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <StatusChip
                              size="sm"
                              tone={mapRiskToChip(a.risk_level)}
                            >
                              {a.risk_level === "critical"
                                ? "Alto risco"
                                : a.risk_level === "moderate"
                                  ? "Risco moderado"
                                  : "Baixo risco"}
                            </StatusChip>
                          </div>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-zinc-500 text-center py-6">
                Nenhum alerta encontrado.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDaysIcon className="size-5 text-slate-600 dark:text-zinc-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Agenda de Atendimentos
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-500 dark:text-zinc-400">
            Carregando agendamentos...
          </div>
        ) : isError ? (
          <div className="p-6 text-red-600 dark:text-red-400">
            Erro ao carregar agendamentos.
          </div>
        ) : (
          <AgendaTable
            enableToolbar
            initialPage={1}
            initialRowsPerPage={8}
            rows={AGENDA_ROWS}
            onAction={handleAction}
          />
        )}
      </section>

      <ProfessionalAppointmentDetailsModal
        data={selectedAppointment}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmModal
        confirmText={confirmData.confirmText}
        message={confirmData.message}
        open={confirmData.open}
        title={confirmData.title}
        tone={confirmData.tone}
        onCancel={() => setConfirmData((p) => ({ ...p, open: false }))}
        onConfirm={confirmData.onConfirm}
      />
    </div>
  );
}
