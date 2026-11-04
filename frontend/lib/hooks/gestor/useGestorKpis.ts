import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";

export type KpiKey =
  | "totalPatients"
  | "atRisk"
  | "appointments"
  | "criticalAlerts";

export type KpiItem = {
  key: KpiKey;
  label: string;
  value: number | string;
  delta?: number;
  accent: "brand" | "amber" | "blue" | "green" | "red";
};

export interface DashboardKPIsResponse {
  total_patients: number;
  total_appointments: number;
  critical_appointments: number;
  critical_alerts: number;
}

/**
 * Hook principal para buscar todos os KPIs do gestor
 * Utiliza o endpoint consolidado de agregação SQL (/api/v1/reports/kpis/)
 */
export function useGestorKpis() {
  const { data, isLoading, isError } = useQuery<DashboardKPIsResponse>({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const resp = await apiGet<DashboardKPIsResponse>("/api/v1/reports/kpis/");

      return (
        resp ?? {
          total_patients: 0,
          total_appointments: 0,
          critical_appointments: 0,
          critical_alerts: 0,
        }
      );
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 3, // 3 min
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;

      return failureCount < 2;
    },
  });

  const totalPatients = data?.total_patients ?? 0;
  const criticalAppointments = data?.critical_appointments ?? 0;
  const totalAppointments = data?.total_appointments ?? 0;
  const criticalAlerts = data?.critical_alerts ?? 0;

  const kpis: KpiItem[] = [
    {
      key: "totalPatients",
      label: "Pacientes Totais",
      value: totalPatients,
      delta: 0,
      accent: "brand",
    },
    {
      key: "atRisk",
      label: "Agendamentos Críticos",
      value: criticalAppointments,
      delta: 0,
      accent: "amber",
    },
    {
      key: "appointments",
      label: "Atendimentos",
      value: totalAppointments,
      delta: 0,
      accent: "blue",
    },
    {
      key: "criticalAlerts",
      label: "Alertas Críticos",
      value: criticalAlerts,
      delta: 0,
      accent: "red",
    },
  ];

  return {
    data: kpis,
    isLoading,
    isError,
  };
}
