"use client";

import type { ProfessionalApi } from "@/lib/api/profissionais";

import { BellAlertIcon, UserGroupIcon } from "@heroicons/react/24/outline";
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
      <header className="flex flex-col gap-2 pt-8 pb-4 md:flex-row md:items-center md:justify-between md:pt-8">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl dark:text-white">
            Dashboard do Gestor
          </h1>
          <p className="mt-1 text-sm text-foreground/60 dark:text-white/80">
            Visão geral da APS •{" "}
            <span className="font-medium">Microárea: Todas</span>
          </p>
        </div>
        <div>
          <nav aria-label="Ações" className="flex items-center gap-2">
            <Button
              as={Link}
              className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
              color="primary"
              href="/pacientes"
              radius="lg"
              size="md"
              variant="solid"
            >
              Lista de Pacientes
            </Button>

            <Button
              as={Link}
              className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
              color="primary"
              href="/cadastros/novo"
              radius="lg"
              size="md"
              variant="solid"
            >
              Novo Profissional
            </Button>

            <Button
              as={Link}
              className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
              color="primary"
              href="/pacientes/novo"
              radius="lg"
              size="md"
              variant="solid"
            >
              Novo Paciente
            </Button>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPIs */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoadingKpis ? (
            <div className="col-span-2 p-6 text-center text-gray-500 dark:text-gray-400">
              Carregando KPIs...
            </div>
          ) : KPIS.length > 0 ? (
            KPIS.map((kpi) => (
              <KpiCard
                key={kpi.key}
                accent={kpi.accent}
                delta={kpi.delta}
                footerText="Dados do sistema atualizados com as informações mais recentes."
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
            <div className="col-span-2 p-6 text-center text-gray-500 dark:text-gray-400">
              Nenhum KPI disponível.
            </div>
          )}
        </section>

        {/* Alertas Recentes */}
        <section className="mt-6 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-transparent dark:border-gray-800 p-4 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellAlertIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Alerta dos Pacientes
              </h2>
            </div>
            <Button
              aria-label="Adicionar alerta"
              className="text-md text-orange-600 bg-transparent border border-orange-600 hover:bg-gray-100 dark:hover:bg-gray-900"
              radius="lg"
              size="sm"
              variant="flat"
              onPress={() => {
                setSelectedAlert(null);
                setOpen(true);
              }}
            >
              +
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
            <div className="max-h-70 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <ul className="space-y-3">
                {alerts
                  .slice()
                  .reverse()
                  .map((a, i) => (
                    <li key={i}>
                      <button
                        className={`w-full cursor-pointer flex items-center justify-between gap-4 rounded-md p-3 shadow-sm hover:shadow-lg transition-colors delay-150 duration-300 ease-in-out ${
                          a.risk_level === "critical"
                            ? "border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/20"
                            : a.risk_level === "moderate"
                              ? "border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/20"
                              : "border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20"
                        }`}
                        type="button"
                        onClick={() => {
                          setSelectedAlert(a);
                          setOpen(true);
                        }}
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

                        <StatusChip
                          size="sm"
                          tone={mapRiskToChip(a.risk_level)}
                        >
                          {a.risk_level === "critical"
                            ? "Crítico"
                            : a.risk_level === "moderate"
                              ? "Atenção"
                              : "Seguro"}
                        </StatusChip>
                      </button>
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

      {/* Profissionais */}
      <section className="mt-6 rounded-md bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm p-4 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <UserGroupIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Profissionais
          </h2>
        </div>
        {isLoadingProfissionais ? (
          <div className="text-gray-500 dark:text-gray-400">
            Carregando profissionais...
          </div>
        ) : isErrorProfissionais ? (
          <div className="text-red-600 dark:text-red-400">
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