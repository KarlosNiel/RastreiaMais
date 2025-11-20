"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { KpiItem } from "@/lib/profissional-kpis";

export function useProfissionalKpis() {
  const pacientesQuery = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const resp = await apiGet("/api/v1/accounts/patients/");
      return Array.isArray(resp) ? resp : resp?.results ?? [];
    },
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet("/api/v1/appointments/appointments/");
      return Array.isArray(resp) ? resp : resp?.results ?? [];
    },
  });

  const alertsQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const resp = await apiGet("/api/v1/alerts/alerts/");
      return Array.isArray(resp) ? resp : resp?.results ?? [];
    },
  });

  const isLoading =
    pacientesQuery.isLoading ||
    appointmentsQuery.isLoading ||
    alertsQuery.isLoading;

  const isError =
    pacientesQuery.isError ||
    appointmentsQuery.isError ||
    alertsQuery.isError;

  if (isLoading) {
    return { isLoading: true, isError: false, data: [] as KpiItem[] };
  }

  if (isError) {
    return { isLoading: false, isError: true, data: [] as KpiItem[] };
  }

  const pacientes = pacientesQuery.data ?? [];
  const appointments = appointmentsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];

  // === KPIs ===
  const totalPatients = pacientes.length;

  const riskPatients = appointments.filter(
    (a: any) => a.risk_level === "Crítico" || a.risk_level === "Moderado"
  ).length;

  const appointmentsCount = appointments.length;

  const criticalAlerts = alerts.filter(
    (a: any) => a.risk_level === "critical"
  ).length;

  const kpis: KpiItem[] = [
    {
      key: "totalPatients",
      label: "Pacientes Totais",
      value: totalPatients,
      accent: "brand",
    },
    {
      key: "riskPatients",
      label: "Pacientes em Risco",
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
      accent: "green",
    },
  ];

  return {
    isLoading: false,
    isError: false,
    data: kpis,
  };
}
