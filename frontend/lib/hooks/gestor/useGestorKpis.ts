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
 * com fallback imediato caso a instância de backend ainda esteja atualizando.
 */
export function useGestorKpis() {
  const { data, isLoading, isError } = useQuery<DashboardKPIsResponse>({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      try {
        const resp = await apiGet<DashboardKPIsResponse>(
          "/api/v1/reports/kpis/",
        );

        if (resp && typeof resp.total_patients === "number") {
          return resp;
        }
      } catch {
        // Fallback gracioso para instâncias de produção que ainda não reiniciaram
      }

      try {
        const [patientsResp, apptsResp, alertsResp] = await Promise.allSettled([
          apiGet<any>("/api/v1/accounts/patients/"),
          apiGet<any>("/api/v1/appointments/appointments/"),
          apiGet<any>("/api/v1/alerts/alerts/"),
        ]);

        const patients =
          patientsResp.status === "fulfilled" && patientsResp.value
            ? (patientsResp.value?.count ??
              (Array.isArray(patientsResp.value)
                ? patientsResp.value.length
                : (patientsResp.value?.results?.length ?? 0)))
            : 0;

        const appts =
          apptsResp.status === "fulfilled" && apptsResp.value
            ? Array.isArray(apptsResp.value)
              ? apptsResp.value
              : (apptsResp.value?.results ?? [])
            : [];

        const alerts =
          alertsResp.status === "fulfilled" && alertsResp.value
            ? Array.isArray(alertsResp.value)
              ? alertsResp.value
              : (alertsResp.value?.results ?? [])
            : [];

        return {
          total_patients: patients,
          total_appointments:
            apptsResp.status === "fulfilled" && apptsResp.value?.count
              ? apptsResp.value.count
              : appts.length,
          critical_appointments: appts.filter(
            (a: any) => a.risk_level === "Crítico",
          ).length,
          critical_alerts: alerts.filter(
            (a: any) => a.risk_level === "critical",
          ).length,
        };
      } catch {
        return {
          total_patients: 0,
          total_appointments: 0,
          critical_appointments: 0,
          critical_alerts: 0,
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 3, // 3 min
    retry: false, // Não bloqueia a UI se o endpoint 404
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
