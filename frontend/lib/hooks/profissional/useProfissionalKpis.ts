"use client";

import type { KpiItem } from "@/lib/profissional-kpis";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";

interface DashboardKPIsResponse {
  total_patients: number;
  total_appointments: number;
  critical_appointments: number;
  critical_alerts: number;
}

export function useProfissionalKpis() {
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

  if (isLoading) {
    return { isLoading: true, isError: false, data: [] as KpiItem[] };
  }

  if (isError) {
    return { isLoading: false, isError: true, data: [] as KpiItem[] };
  }

  const totalPatients = data?.total_patients ?? 0;
  const riskPatients = data?.critical_appointments ?? 0;
  const appointmentsCount = data?.total_appointments ?? 0;
  const criticalAlerts = data?.critical_alerts ?? 0;

  const kpis: KpiItem[] = [
    {
      key: "totalPatients",
      label: "Pacientes Totais",
      value: totalPatients,
      accent: "brand",
    },
    {
      key: "riskPatients",
      label: "Agendamentos de Risco",
      value: riskPatients,
      accent: "amber",
    },
    {
      key: "appointments",
      label: "Atendimentos",
      value: appointmentsCount,
      accent: "blue",
    },
    {
      key: "criticalAlerts",
      label: "Alertas Críticos",
      value: criticalAlerts,
      accent: "red",
    },
  ];

  return {
    isLoading: false,
    isError: false,
    data: kpis,
  };
}
