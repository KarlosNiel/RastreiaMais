import {
  UsersIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export type KpiKey =
  | "totalPatients"
  | "riskPatients"
  | "appointments"
  | "criticalAlerts";

export type KpiItem = {
  key: KpiKey;
  label: string;
  value: number | string;
  delta?: number;
  accent: "brand" | "amber" | "blue" | "green" | "red";
};

// Ícones padronizados com Heroicons
export const KPI_ICONS: Record<KpiKey, ReactNode> = {
  totalPatients: (
    <UsersIcon className="size-5 text-current stroke-orange-600" />
  ),
  riskPatients: (
    <ExclamationTriangleIcon className="size-5 text-current stroke-orange-600" />
  ),
  appointments: (
    <CalendarDaysIcon className="size-5 text-current stroke-orange-600" />
  ),
  criticalAlerts: (
    <BellAlertIcon className="size-5 text-current stroke-orange-600" />
  ),
};

export async function getProfissionalKpis(): Promise<KpiItem[]> {
  // mock: troque por chamada de API/DB quando integrar
  return [
    {
      key: "totalPatients",
      label: "Pacientes Totais",
      value: 1309,
      delta: +2,
      accent: "brand",
    },
    {
      key: "riskPatients",
      label: "Pacientes em Risco",
      value: 24,
      delta: -1,
      accent: "amber",
    },
    {
      key: "appointments",
      label: "Atendimentos",
      value: 84,
      delta: +11,
      accent: "blue",
    },
    {
      key: "criticalAlerts",
      label: "Alertas Críticos",
      value: 2,
      accent: "green",
    },
  ];
}
