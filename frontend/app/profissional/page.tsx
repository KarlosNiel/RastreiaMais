"use client";

import {
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

import CreateAppointmentsModal from "@/components/appointments/CreateAppointmentsModal";
import { KpiCard } from "@/components/dashboard/KpiCard";
import CreateAlertModal from "@/components/gestor/CreateAlertModal";
import {
  AgendaTable,
  type AgendaRow,
  type AgendaViewSnapshot,
} from "@/components/profissional/AgendaTable";
import ConfirmModal from "@/components/profissional/ConfirmModal";
import ExportAppointmentsPdfModal from "@/components/profissional/ExportAppointmentsPdfModal";
import ProfessionalAppointmentDetailsModal from "@/components/profissional/ProfessionalAppointmentDetailsModal";
import { AlertsListSkeleton } from "@/components/skeletons/AlertsListSkeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { StatusChip } from "@/components/ui/StatusChip";
import { notifyError, notifySuccess, notifyWarn } from "@/components/ui/notify";
import { apiGet, apiPatch } from "@/lib/api";
import { useAlertsQuery } from "@/lib/hooks/alerts/useAlertsQuery";
import { useProfissionalKpis } from "@/lib/hooks/profissional/useProfissionalKpis";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  DEFAULT_EXPORT_PDF_OPTIONS,
  type ExportPdfOptions,
  type PdfPeriodPreset,
  buildExportScopeLabel,
  filterAndSortAppointmentsForExport,
  parseAppointmentDate,
  toLocalDateKey,
} from "@/lib/pdf/appointmentsPdfFilters";
import { downloadAppointmentsPdf } from "@/lib/pdf/exportAppointmentsPdf";
import { KPI_ICONS } from "@/lib/profissional-kpis";
import {
  capitalizeWords,
  formatCns,
  formatCpf,
  formatPhone,
} from "@/lib/utils";

type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";

interface AppointmentResponse {
  id: number;
  patient?: {
    id: number;
    conditions?: string;
    cpf?: string;
    sus?: string;
    phone?: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
  } | null;
  professional?: {
    id?: number;
    role?: string;
    professional_registry?: string;
    user?: {
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  } | null;
  scheduled_datetime: string;
  local?: {
    name?: string;
  } | null;
  risk_level: "Seguro" | "Moderado" | "Crítico";
  description?: string;
  type: string;
  status?: string;
}

function mapRiskLevel(level?: string | null): RiskTone {
  const normalized = (level ?? "").trim().toLowerCase();

  switch (normalized) {
    case "moderado":
    case "moderate":
      return "moderate";
    case "crítico":
    case "critico":
    case "critical":
      return "critical";
    default:
      return "safe";
  }
}

const mapRiskToChip = (t?: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : (t ?? "safe");

function mapAppointmentToAgendaRow(a: AppointmentResponse): AgendaRow {
  const rawName =
    `${a.patient?.user?.first_name ?? ""} ${a.patient?.user?.last_name ?? ""}`.trim() ||
    "Desconhecido";
  const rawProfName =
    `${a.professional?.user?.first_name ?? ""} ${a.professional?.user?.last_name ?? ""}`.trim() ||
    a.professional?.user?.username ||
    "";

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
    susMasked: a.patient?.sus ? formatCns(a.patient.sus) : "",
    patientPhone: a.patient?.phone ? formatPhone(a.patient.phone) : "",
    professionalName: rawProfName ? capitalizeWords(rawProfName) : undefined,
    professionalRole: a.professional?.role || undefined,
    professionalRegistry: a.professional?.professional_registry || undefined,
    status: a.status || "ativo",
  };
}

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
  const [isExportPdfModalOpen, setIsExportPdfModalOpen] = useState(false);
  const [exportModalInitialPeriod, setExportModalInitialPeriod] =
    useState<PdfPeriodPreset>("current");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState("");
  const [viewSnapshot, setViewSnapshot] = useState<AgendaViewSnapshot | null>(
    null,
  );
  const [fullExportRows, setFullExportRows] = useState<AgendaRow[] | null>(
    null,
  );
  const hasMoreAppointmentsRef = useRef(false);

  const { user } = useAuth();
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

      if (Array.isArray(resp)) {
        hasMoreAppointmentsRef.current = false;

        return resp;
      }

      if (
        resp &&
        typeof resp === "object" &&
        "results" in resp &&
        Array.isArray((resp as any).results)
      ) {
        hasMoreAppointmentsRef.current = Boolean((resp as any).next);

        return (resp as any).results as AppointmentResponse[];
      }

      hasMoreAppointmentsRef.current = false;

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
        queryClient.setQueryData<any>(["appointments"], (old: any) => {
          if (!old) return [];
          const list = Array.isArray(old)
            ? old
            : Array.isArray(old?.results)
              ? old.results
              : [];

          return list.map((appt: any) =>
            String(appt.id) === String(id) ? { ...appt, status } : appt,
          );
        });
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
    return safeAppointments.map(mapAppointmentToAgendaRow);
  }, [safeAppointments]);

  const allExportRows = fullExportRows ?? AGENDA_ROWS;
  const currentViewRows = viewSnapshot ? viewSnapshot.rows : AGENDA_ROWS;
  const currentViewSummary = viewSnapshot?.summary ?? "Todos os agendamentos";

  const issuerName = useMemo(() => {
    if (!user) return "Profissional APS";
    const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

    return capitalizeWords(full || user.username || "Profissional APS");
  }, [user]);

  const { todayCount, activeCount } = useMemo(() => {
    const todayKey = toLocalDateKey(new Date());
    let today = 0;
    let active = 0;

    for (const row of AGENDA_ROWS) {
      if (row.status === "ativo") active += 1;
      const parsed = parseAppointmentDate(row);

      if (parsed && toLocalDateKey(parsed) === todayKey) {
        today += 1;
      }
    }

    return { todayCount: today, activeCount: active };
  }, [AGENDA_ROWS]);

  const resolveCompleteRows = useCallback(async (): Promise<AgendaRow[]> => {
    if (!hasMoreAppointmentsRef.current) {
      return AGENDA_ROWS;
    }

    if (fullExportRows && fullExportRows.length >= AGENDA_ROWS.length) {
      return fullExportRows;
    }

    try {
      const resp = await apiGet<
        AppointmentResponse[] | { results?: AppointmentResponse[] }
      >("/api/v1/appointments/appointments/?page_size=all");

      const list = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.results)
          ? resp.results
          : [];

      if (list.length > 0) {
        const mapped = list.map(mapAppointmentToAgendaRow);

        setFullExportRows(mapped);

        return mapped;
      }
    } catch {
      // Caso falhe a carga completa, segue com os agendamentos já carregados
    }

    return AGENDA_ROWS;
  }, [AGENDA_ROWS, fullExportRows]);

  const runPdfExport = useCallback(
    async (options: ExportPdfOptions, explicitScopeLabel?: string) => {
      try {
        setIsExportingPdf(true);

        const dataset =
          options.period === "current"
            ? AGENDA_ROWS
            : await resolveCompleteRows();

        const targetRows = filterAndSortAppointmentsForExport(
          dataset,
          currentViewRows,
          options,
        );

        if (targetRows.length === 0) {
          notifyWarn(
            "Nenhum agendamento para exportar",
            "Não há registros correspondentes ao filtro selecionado.",
          );

          return false;
        }

        const scopeLabel =
          explicitScopeLabel ||
          buildExportScopeLabel(options, currentViewSummary);

        const result = await downloadAppointmentsPdf({
          rows: targetRows,
          options,
          scopeLabel,
          issuerName,
        });

        const countLabel =
          result.count === 1
            ? "1 agendamento exportado"
            : `${result.count} agendamentos exportados`;

        setPdfStatusMessage(
          `Arquivo PDF ${result.filename} baixado com ${countLabel}.`,
        );
        notifySuccess(
          "PDF gerado com sucesso!",
          `${countLabel} em ${result.filename}`,
        );

        return true;
      } catch {
        notifyError(
          "Erro ao gerar PDF",
          "Não foi possível gerar o arquivo PDF dos agendamentos.",
        );

        return false;
      } finally {
        setIsExportingPdf(false);
      }
    },
    [
      AGENDA_ROWS,
      currentViewRows,
      currentViewSummary,
      issuerName,
      resolveCompleteRows,
    ],
  );

  const openExportModal = useCallback(
    (initialPeriod: PdfPeriodPreset = "current") => {
      setExportModalInitialPeriod(initialPeriod);
      setIsExportPdfModalOpen(true);

      if (hasMoreAppointmentsRef.current) {
        void resolveCompleteRows();
      }
    },
    [resolveCompleteRows],
  );

  const handleQuickPdfDownload = useCallback(() => {
    if (currentViewRows.length === 0) {
      if (AGENDA_ROWS.length > 0) {
        notifyWarn(
          "Filtro atual sem registros",
          "Selecione outro período ou filtro para baixar os agendamentos.",
        );
        openExportModal("all");
      }

      return;
    }

    void runPdfExport({
      ...DEFAULT_EXPORT_PDF_OPTIONS,
      period: "current",
    });
  }, [
    AGENDA_ROWS.length,
    currentViewRows.length,
    openExportModal,
    runPdfExport,
  ]);

  const handlePresetPdfDownload = useCallback(
    (period: PdfPeriodPreset) => {
      void runPdfExport({
        ...DEFAULT_EXPORT_PDF_OPTIONS,
        period,
      });
    },
    [runPdfExport],
  );

  const handleActiveQueuePdfDownload = useCallback(() => {
    void runPdfExport(
      {
        ...DEFAULT_EXPORT_PDF_OPTIONS,
        period: "all",
        statuses: ["ativo"],
      },
      "Fila de Atendimento (Somente ativos)",
    );
  }, [runPdfExport]);

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
            Atendimentos Clínicos
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
            href="/profissional/dashboard"
            radius="md"
            size="md"
            startContent={
              <ChartBarSquareIcon
                className="size-4 text-primary"
                strokeWidth={2}
              />
            }
            variant="bordered"
          >
            Dashboard Clínico
          </Button>

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-5 text-slate-600 dark:text-zinc-300" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Agenda de Atendimentos
            </h2>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              aria-label={`Baixar PDF (${currentViewRows.length} ${currentViewRows.length === 1 ? "agendamento" : "agendamentos"})`}
              className="font-medium text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-2xs"
              isDisabled={isLoading || isError || AGENDA_ROWS.length === 0}
              isLoading={isExportingPdf}
              radius="md"
              size="sm"
              startContent={
                !isExportingPdf ? (
                  <DocumentArrowDownIcon className="size-4 text-primary" />
                ) : undefined
              }
              variant="bordered"
              onPress={handleQuickPdfDownload}
            >
              Baixar PDF
              {!isLoading && !isError && AGENDA_ROWS.length > 0 && (
                <span className="ml-0.5 rounded-md bg-slate-100 dark:bg-zinc-700/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-300 tabular-nums">
                  {currentViewRows.length}
                </span>
              )}
            </Button>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  aria-label="Opções de exportação em PDF"
                  className="size-8 min-w-8 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 shadow-2xs"
                  isDisabled={
                    isLoading ||
                    isError ||
                    AGENDA_ROWS.length === 0 ||
                    isExportingPdf
                  }
                  radius="md"
                  size="sm"
                  variant="bordered"
                >
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Opções de exportação em PDF"
                variant="flat"
              >
                <DropdownSection showDivider title="Exportação rápida">
                  <DropdownItem
                    key="current"
                    description={`Conforme filtro da tabela (${currentViewRows.length})`}
                    startContent={
                      <DocumentArrowDownIcon className="size-4 text-primary" />
                    }
                    onPress={handleQuickPdfDownload}
                  >
                    Baixar visualização atual
                  </DropdownItem>
                  <DropdownItem
                    key="all"
                    description={`Todos os registros (${AGENDA_ROWS.length})`}
                    startContent={
                      <CalendarDaysIcon className="size-4 text-slate-500" />
                    }
                    onPress={() => handlePresetPdfDownload("all")}
                  >
                    Baixar todos os agendamentos
                  </DropdownItem>
                  <DropdownItem
                    key="today"
                    description={`Agendamentos de hoje (${todayCount})`}
                    startContent={<ClockIcon className="size-4 text-sky-600" />}
                    onPress={() => handlePresetPdfDownload("today")}
                  >
                    Baixar agendamentos de hoje
                  </DropdownItem>
                  <DropdownItem
                    key="active"
                    description={`Fila de atendimento ativa (${activeCount})`}
                    startContent={
                      <CheckCircleIcon className="size-4 text-emerald-600" />
                    }
                    onPress={handleActiveQueuePdfDownload}
                  >
                    Baixar fila ativa
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                  <DropdownItem
                    key="customize"
                    description="Período personalizado, status, risco e layout"
                    startContent={
                      <AdjustmentsHorizontalIcon className="size-4 text-slate-600 dark:text-zinc-300" />
                    }
                    onPress={() => openExportModal("current")}
                  >
                    Personalizar PDF...
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <p className="sr-only" role="status">
          {pdfStatusMessage}
        </p>

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
            onFilteredRowsChange={setViewSnapshot}
          />
        )}
      </section>

      {/* Modais de ação */}
      <ExportAppointmentsPdfModal
        allRows={allExportRows}
        currentViewRows={currentViewRows}
        currentViewSummary={currentViewSummary}
        initialPeriod={exportModalInitialPeriod}
        isExporting={isExportingPdf}
        open={isExportPdfModalOpen}
        onExport={async (options, scopeLabel) => {
          const ok = await runPdfExport(options, scopeLabel);

          if (ok) {
            setIsExportPdfModalOpen(false);
          }
        }}
        onOpenChange={setIsExportPdfModalOpen}
      />
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
