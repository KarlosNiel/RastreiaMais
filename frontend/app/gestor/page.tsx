// frontend/app/gestor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PendenciasTable } from "@/components/gestor/PendenciasTable";
import { ProfissionaisTable } from "@/components/gestor/ProfissionaisTable";
import { RMButton } from "@/components/ui/RMButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { getGestorKpis, KPI_ICONS } from "@/lib/gestor-kpis";
import {
  ChartBarIcon,
  BellAlertIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@heroui/button";
import { useAlertsQuery } from "@/lib/hooks/alerts/useAlertsQuery";
import CreateAlertModal from "@/components/gestor/CreateAlertModal";
import { Spinner } from "@heroui/spinner";

type RiskTone = "safe" | "moderate" | "critical";

const mapRiskToChip = (t: RiskTone): "safe" | "attention" | "critical" =>
  t === "moderate" ? "attention" : t;

export default function GestorPage() {
  const [open, setOpen] = useState(false);
  const { data: alerts, isLoading } = useAlertsQuery();
  const [KPIS, setKPIS] = useState<any[]>([]);

  useEffect(() => {
    getGestorKpis().then(setKPIS);
  }, []);

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
              href="/cadastros/novo"
              color="primary"
              variant="solid"
              radius="lg"
              size="md"
              className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
            >
              Novo Profissional
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
              Novo Paciente
            </Button>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPIs */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KPIS.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              accent={kpi.accent}
              icon={(KPI_ICONS as Record<string, import("react").ReactNode>)[kpi.key]}
            />
          ))}
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
              onPress={() => setOpen(true)}
              variant="flat"                
              size="sm"
              aria-label="Adicionar alerta"
              radius="lg"
              className="text-md text-orange-600 bg-transparent border border-orange-600 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              +
            </Button>
          </div>

          <CreateAlertModal open={open} onOpenChange={setOpen} />

{isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner color="warning" />
            </div>
          ) : alerts?.length ? (
            <ul className="space-y-3">
              {alerts.map((a, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between gap-4 rounded-md p-3 shadow-sm hover:shadow-lg transition-colors delay-150 duration-300 ease-in-out ${
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
                        {a.patient?.user?.first_name ?? "—"} {a.patient?.user?.last_name ?? "—"}{" "}
                        <span className="text-gray-500 dark:text-gray-400">
                          {a.patient?.cpf ?? "—"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
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
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">
              Nenhum alerta encontrado.
            </p>
          )}
        </section>
      </div>

      {/* Pendências */}
      <section className="mt-6 rounded-md bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm p-4 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardDocumentListIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Pendências
          </h2>
        </div>
          <PendenciasTable
            rows={[
              { id: "1", paciente: "Fernanda", pendencias: "Medição PA", dias: 64, microarea: "Jardim Magnólia", risco: "safe" },
              { id: "2", paciente: "José", pendencias: "Enfermeira", dias: 55, microarea: "Jardim Magnólia", risco: "safe" },
              { id: "3", paciente: "Ana", pendencias: "Consulta médica", dias: 43, microarea: "Jardim Magnólia", risco: "moderate" },
              { id: "4", paciente: "Clara", pendencias: "Avaliação", dias: 42, microarea: "Jardim Magnólia", risco: "critical" },
            ]}
            initialPage={1}
            initialRowsPerPage={6}
          />
      </section>

      {/* Profissionais */}
      <section className="mt-6 rounded-md bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm p-4 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <UserGroupIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Profissionais
          </h2>
        </div>
          <ProfissionaisTable
            rows={[
              { id: "p1", profissional: "Fernanda", cargo: "Enfermeira", local: "USF Maria Madalena", status: "Ativo" },
              { id: "p2", profissional: "Marcos", cargo: "Médico", local: "USF Maria Madalena", status: "Ativo" },
              { id: "p3", profissional: "Carla", cargo: "Téc. Enfermagem", local: "USF Maria Madalena", status: "Licença" },
              { id: "p4", profissional: "Rafael", cargo: "ACS", local: "USF Maria Madalena", status: "Afastado" },
            ]}
            initialPage={1}
            initialRowsPerPage={6}
          />
      </section>
    </div>
  );
}
