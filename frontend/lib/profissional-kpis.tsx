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

// Ícones padronizados
export const KPI_ICONS: Record<KpiKey, ReactNode> = {
  totalPatients: (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 1.67-8 5v1h16v-1c0-3.33-3.67-5-8-5Z"
      />
    </svg>
  ),
  riskPatients: (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2 1 21h22L12 2Zm1 14h-2v-2h2v2Zm0-4h-2V8h2v4Z"
      />
    </svg>
  ),
  appointments: (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M19 3H5a2 2 0 0 0-2 2v12l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
      />
    </svg>
  ),
  criticalAlerts: (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2V9h2v5Z"
      />
    </svg>
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
