"use client";

import type { ProfessionalApi } from "@/lib/api/profissionais";

import {
  BellAlertIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { KpiCard } from "@/components/dashboard/KpiCard";
import CreateAlertModal from "@/components/gestor/CreateAlertModal";
import {
  ProfissionaisTable,
  ProfRow,
} from "@/components/gestor/ProfissionaisTable";
import { StatusChip } from "@/components/ui/StatusChip";
import { apiGet } from "@/lib/api";
import { KPI_ICONS } from "@/lib/gestor-kpis";
import { useAlertsQuery } from "@/lib/hooks/alerts/useAlertsQuery";
import { useGestorKpis } from "@/lib/hooks/gestor/useGestorKpis";

type RiskTone = "safe" | "moderate" | "critical";

const mapRiskToChip = (t?: RiskTone): "safe" | "attention" | "critical" =>
  t === "moderate" ? "attention" : (t ?? "safe");

export default function GestorPage() {
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  //! Busca KPIs usando o novo hook
  const { data: KPIS = [], isLoading: isLoadingKpis } = useGestorKpis();

  //! Busca alertas
  const { data: alerts, isLoading: isLoadingAlerts } = useAlertsQuery();

  const formatCpf = (cpf?: string) => {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");

    if (digits.length !== 11) return cpf;

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  //! Busca profissionais
  const {
    data: profissionais = [],
    isLoading: isLoadingProfissionais,
    isError: isErrorProfissionais,
  } = useQuery<ProfRow[]>({
    queryKey: ["professionals"],
    queryFn: async () => {
      const resp = await apiGet<
        ProfessionalApi[] | { results: ProfessionalApi[] }
      >("/api/v1/accounts/professionals/");

      const list: ProfessionalApi[] = Array.isArray(resp)
        ? resp
        : resp && "results" in resp && Array.isArray(resp.results)
          ? resp.results
          : [];

      const mapped: ProfRow[] = list.map((p) => {
        const first = p.user?.first_name ?? "";
        const last = p.user?.last_name ?? "";
        const nome = `${first} ${last}`.trim() || p.user?.username || "—";

        // Status derivado de is_deleted (soft delete)
        const status: ProfRow["status"] = p.is_deleted ? "Afastado" : "Ativo";

        return {
          id: String(p.id),
          profissional: nome,
          cargo: p.role ?? "—",
          local: "USF Maria Madalena",
          status,
        };
      });

      return mapped;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Header */}
      <header className="flex flex-col gap-4 pt-8 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Dashboard do Gestor
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Visão geral da APS &bull;{" "}
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Microárea: Todas
            </span>
          </p>
        </div>
        <div>
          <nav aria-label="Ações" className="flex items-center gap-2.5">
            <Button
              as={Link}
              className="font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-2xs"
              href="/pacientes"
              radius="md"
              size="md"
              variant="bordered"
            >
              Lista de Pacientes
            </Button>

            <Button
              as={Link}
              className="font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-2xs"
              href="/cadastros/novo"
              radius="md"
              size="md"
              variant="bordered"
            >
              Novo Profissional
            </Button>

            <Button
              as={Link}
              className="font-medium text-white bg-primary hover:bg-primary/90 shadow-2xs"
              color="primary"
              href="/pacientes/novo"
              radius="md"
              size="md"
              startContent={<PlusIcon className="size-4" strokeWidth={2.5} />}
              variant="solid"
            >
              Novo Paciente
            </Button>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPIs */}
        <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoadingKpis ? (
            <div className="col-span-2 p-6 text-center text-slate-500 dark:text-zinc-400">
              Carregando KPIs...
            </div>
          ) : KPIS.length > 0 ? (
            KPIS.map((kpi) => (
              <KpiCard
                key={kpi.key}
                accent={kpi.accent}
                delta={kpi.delta}
                icon={
                  (KPI_ICONS as Record<string, import("react").ReactNode>)[
                    kpi.key
                  ]
                }
                label={kpi.label}
                value={kpi.value}
              />
            ))
          ) : (
            <div className="col-span-2 p-6 text-center text-slate-500 dark:text-zinc-400">
              Nenhum KPI disponível.
            </div>
          )}
        </section>

        {/* Alertas Recentes */}
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
                  setOpen(true);
                }}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>

            <CreateAlertModal
              alertData={selectedAlert}
              open={open}
              onOpenChange={setOpen}
            />

            {isLoadingAlerts ? (
              <div className="flex justify-center py-8">
                <Spinner color="warning" />
              </div>
            ) : alerts?.length ? (
              <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                <ul className="space-y-2.5">
                  {alerts
                    .slice()
                    .reverse()
                    .map((a, i) => (
                      <li key={i}>
                        <button
                          className="group w-full cursor-pointer flex items-center justify-between gap-3 rounded-lg p-3 border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-200 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 dark:hover:border-zinc-700 transition-all text-left"
                          type="button"
                          onClick={() => {
                            setSelectedAlert(a);
                            setOpen(true);
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

      {/* Profissionais */}
      <section className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <UserGroupIcon className="size-5 text-slate-600 dark:text-zinc-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Quadro de Profissionais
          </h2>
        </div>
        {isLoadingProfissionais ? (
          <div className="p-6 text-slate-500 dark:text-zinc-400">
            Carregando profissionais...
          </div>
        ) : isErrorProfissionais ? (
          <div className="p-6 text-red-600 dark:text-red-400">
            Erro ao carregar profissionais.
          </div>
        ) : (
          <ProfissionaisTable
            initialPage={1}
            initialRowsPerPage={6}
            rows={profissionais}
            onAction={(action, row) => {
              if (action === "edit" || action === "open") {
                router.push(`/cadastros/${row.id}/editar`);
              }
            }}
          />
        )}
      </section>
    </div>
  );
}
