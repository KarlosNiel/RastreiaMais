"use client";

import type { KpiItem } from "@/lib/profissional-kpis";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { apiGet } from "@/lib/api";

interface DashboardKPIsResponse {
  total_patients: number;
  total_appointments: number;
  critical_appointments: number;
  critical_alerts: number;
}

export type UseProfissionalKpisProps = {
  appointments?: any[];
  alerts?: any[];
  isLoading?: boolean;
};

export function useProfissionalKpis(props?: UseProfissionalKpisProps) {
  // Chamada de agregação no backend (sem retries caso o backend ainda não tenha subido o novo endpoint)
  const { data: remoteKpis } = useQuery<DashboardKPIsResponse | null>({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      try {
        const resp = await apiGet<DashboardKPIsResponse>(
          "/api/v1/reports/kpis/",
        );

        if (resp && typeof resp.total_patients === "number") {
          return resp;
        }

        return null;
      } catch {
        return null;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 3, // 3 min
    retry: false, // Não bloqueia nem retenta caso o backend em prod ainda esteja com versão anterior
  });

  const kpis = useMemo<KpiItem[]>(() => {
    const appts = props?.appointments ?? [];
    const alertsList = props?.alerts ?? [];

    const appointmentsCount = remoteKpis?.total_appointments ?? appts.length;

    const riskPatients =
      remoteKpis?.critical_appointments ??
      appts.filter((a: any) => a.risk_level === "Crítico").length;

    const criticalAlerts =
      remoteKpis?.critical_alerts ??
      alertsList.filter((a: any) => a.risk_level === "critical").length;

    const totalPatients =
      remoteKpis?.total_patients ??
      new Set(appts.map((a: any) => a.patient?.id || a.patient).filter(Boolean))
        .size;

    return [
      {
        key: "totalPatients",
        label: "Pacientes Totais",
        value: totalPatients,
        accent: "brand",
        footerText: "Cadastrados na microárea",
      },
      {
        key: "riskPatients",
        label: "Agendamentos de Risco",
        value: riskPatients,
        accent: "amber",
        footerText: "Acompanhamento prioritário",
      },
      {
        key: "appointments",
        label: "Atendimentos",
        value: appointmentsCount,
        accent: "blue",
        footerText: "Registrados no período",
      },
      {
        key: "criticalAlerts",
        label: "Alertas Críticos",
        value: criticalAlerts,
        accent: "red",
        footerText: "Atenção clínica imediata",
      },
    ];
  }, [props?.appointments, props?.alerts, remoteKpis]);

  const isLoading = props?.isLoading ?? false;

  return {
    isLoading,
    isError: false,
    data: kpis,
  };
}
