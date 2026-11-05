"use client";

import {
  BellAlertIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import { KpiCard } from "@/components/dashboard/KpiCard";
import CreateAlertModal from "@/components/gestor/CreateAlertModal";
import CreateAppointmentsModal from "@/components/appointments/CreateAppointmentsModal";
import {
  AgendaTable,
  type AgendaRow,
} from "@/components/profissional/AgendaTable";
import ProfessionalAppointmentDetailsModal from "@/components/profissional/ProfessionalAppointmentDetailsModal";
import { AlertsListSkeleton } from "@/components/skeletons/AlertsListSkeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { StatusChip } from "@/components/ui/StatusChip";
import { apiGet, apiPatch } from "@/lib/api";
import { useAlertsQuery } from "@/lib/hooks/alerts/useAlertsQuery";
import { useProfissionalKpis } from "@/lib/hooks/profissional/useProfissionalKpis";
import { KPI_ICONS } from "@/lib/profissional-kpis";
import ConfirmModal from "@/components/profissional/ConfirmModal";
import { notifyError, notifySuccess } from "@/components/ui/notify";
import { capitalizeWords, formatCpf } from "@/lib/utils";

type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";

interface AppointmentResponse {
  id: number;
  patient?: {
    id: number;
    conditions?: string;
    cpf?: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
  } | null;
  professional?: any;
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
  const [selectedAppointment, setSelectedAppointment] =
    useState<AgendaRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: rawAlerts, isLoading: isLoadingAlerts } = useAlertsQuery();
  const alerts = useMemo<any[]>(() => {
    if (Array.isArray(rawAlerts)) return rawAlerts;
    if (
      rawAlerts &&
      typeof rawAlerts === "object" &&
      "results" in (rawAlerts as any) &&
      Array.isArray((rawAlerts as any).results)
    ) {
      return (rawAlerts as any).results as any[];
    }
    return [];
  }, [rawAlerts]);

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

  // Normalização defensiva para garantir que nunca quebre caso a resposta venha paginada
  const safeAppointments = useMemo<AppointmentResponse[]>(() => {
    if (Array.isArray(appointments)) return appointments;
    if (
      appointments &&
      typeof appointments === "object" &&
      "results" in (appointments as any) &&
      Array.isArray((appointments as any).results)
    ) {
      return (appointments as any).results as AppointmentResponse[];
    }
    return [];
  }, [appointments]);

  const { data: KPIS = [], isLoading: isLoadingKpis } = useProfissionalKpis({
    appointments: safeAppointments,
    alerts,
    isLoading: isLoading || isLoadingAlerts,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiPatch(`/api/v1/appointments/appointments/${id}/`, {
        status,
      });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      const previousAppointments = queryClient.getQueryData<
        AppointmentResponse[]
      >(["appointments"]);

      if (previousAppointments) {
        queryClient.setQueryData<AppointmentResponse[]>(
          ["appointments"],
          (old) => {
            if (!old) return [];

            return old.map((appt) =>
              String(appt.id) === String(id) ? { ...appt, status } : appt,
            );
          },
        );
      }

      return { previousAppointments };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          ["appointments"],
          context.previousAppointments,
        );
      }
      notifyError("Erro ao atualizar o status do agendamento");
    },
    onSuccess: (_data, variables) => {
      notifySuccess(
        variables.status === "finalizado"
          ? "Agendamento finalizado com sucesso"
          : "Agendamento cancelado com sucesso",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
    },
  });

  const AGENDA_ROWS: AgendaRow[] = useMemo(() => {
    return (
      safeAppointments.map((a) => {
        const rawName =
          `${a.patient?.user?.first_name ?? ""} ${a.patient?.user?.last_name ?? ""}`.trim() ||
          "Desconhecido";

        return {
          id: String(a.id),
          patientId: a.patient?.id ? String(a.patient.id) : undefined,
          paciente: capitalizeWords(rawName),
          hora: new Date(a.scheduled_datetime).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          rawDate: a.scheduled_datetime,
          local: a.local?.name ?? "UBS Jardim Magnólia",
          type: a.type ?? "Consulta",
          risco: mapRiskLevel(a.risk_level),
          condicao: a.patient?.conditions ?? "—",
          description: a.description || "",
          docMasked: a.patient?.cpf ? formatCpf(a.patient.cpf) : "",
          status: a.status || "ativo",
        };
      })
    );
  }, [safeAppointments]);

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

  // Formatação amigável da data atual
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

  const criticalAlertsCount = alerts?.filter(
    (a) => a.risk_level === "critical",
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 pt-8 pb-3 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Dashboard do Profissional
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {dateFormatted} &bull;{" "}
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Microárea: Jardim Magnólia
            </span>
          </p>
        </div>
        <nav aria-label="Ações rápidas" className="flex items-center gap-2.5">
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

          <Button
            className="font-medium text-white bg-primary hover:bg-primary/90 shadow-2xs"
            color="primary"
            radius="md"
            size="md"
            startContent={
              <CalendarDaysIcon className="size-4" strokeWidth={2.2} />
            }
            variant="solid"
            onPress={() => setIsCreateAppointmentOpen(true)}
          >
            Agendar Atendimento
          </Button>
        </nav>
      </header>

      {/* Grid de 4 Indicadores KPIs */}
      <section
        aria-label="Indicadores gerais"
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoadingKpis ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          KPIS.map((kpi) => (
            <KpiCard
              key={kpi.key}
              accent={kpi.accent}
              delta={kpi.delta}
              footerText={(kpi as any).footerText}
              icon={(KPI_ICONS as Record<string, React.ReactNode>)[kpi.key]}
              label={kpi.label}
              value={kpi.value}
            />
          ))
        )}
      </section>

      {/* Seção de Alertas dos Pacientes */}
      <section
        aria-label="Alertas dos Pacientes"
        className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4.5 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center size-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <BellAlertIcon className="size-4.5" />
              {criticalAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                Alertas Clínicos dos Pacientes
                {alerts && alerts.length > 0 && (
                  <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 tabular-nums">
                    {alerts.length}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <Button
            className="text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 shadow-2xs"
            radius="md"
            size="sm"
            startContent={<PlusIcon className="size-3.5" />}
            variant="flat"
            onPress={() => {
              setSelectedAlert(null);
              setIsAlertModalOpen(true);
            }}
          >
            Novo Alerta
          </Button>
        </div>

        {isLoadingAlerts ? (
          <div className="pt-4">
            <AlertsListSkeleton count={2} />
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="mt-3.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {alerts
                .slice()
                .reverse()
                .map((a, i) => {
                  const patientName = capitalizeWords(
                    `${a.patient?.user?.first_name ?? ""} ${a.patient?.user?.last_name ?? ""}`.trim() ||
                      "Paciente não identificado",
                  );

                  return (
                    <li key={a.id || i}>
                      <button
                        className="group w-full cursor-pointer flex items-center justify-between gap-3 rounded-xl p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/70 dark:hover:border-zinc-700 transition-all text-left"
                        type="button"
                        onClick={() => {
                          setSelectedAlert(a);
                          setIsAlertModalOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 shadow-2xs group-hover:text-slate-700 dark:group-hover:text-zinc-200">
                            <UserGroupIcon className="size-4.5" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate w-full">
                              {patientName}
                              {a.patient?.cpf && (
                                <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono font-normal ml-1.5">
                                  ({formatCpf(a.patient.cpf)})
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate w-full mt-0.5">
                              {a.title}
                              {a.description ? ` — ${a.description}` : ""}
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
                  );
                })}
            </ul>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum alerta crítico ativo no momento. Todos os pacientes estáveis.
          </div>
        )}
      </section>

      {/* Seção Agenda de Atendimentos */}
      <section className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDaysIcon className="size-5 text-slate-600 dark:text-zinc-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Agenda de Atendimentos
          </h2>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
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

      {/* Modais de ação */}
      <CreateAlertModal
        alertData={selectedAlert}
        open={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
      />

      <CreateAppointmentsModal
        open={isCreateAppointmentOpen}
        onOpenChange={setIsCreateAppointmentOpen}
      />

      <ProfessionalAppointmentDetailsModal
        data={selectedAppointment}
        open={isModalOpen}
        onCancel={(row) => {
          setIsModalOpen(false);
          handleAction("delete", row);
        }}
        onClose={() => setIsModalOpen(false)}
        onDone={(row) => {
          setIsModalOpen(false);
          handleAction("done", row);
        }}
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
