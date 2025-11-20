
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

interface PatientsResponse {
    results?: any[];
    count?: number;
    [key: string]: any;
}

interface AppointmentsResponse {
    results?: Array<{
        id: number;
        risk_level?: "Seguro" | "Moderado" | "Crítico";
        status?: string;
    }>;
    count?: number;
    [key: string]: any;
}

interface AlertsResponse {
    results?: Array<{
        id: number;
        risk_level?: "safe" | "moderate" | "critical";
    }>;
    [key: string]: any;
}

/**
 * Hook para buscar total de pacientes
 */
function usePatientsCount() {
    return useQuery({
        queryKey: ["patients-count"],
        queryFn: async () => {
            const resp = await apiGet<PatientsResponse>("/api/v1/accounts/patients/");
            return resp?.count ??
                (Array.isArray(resp) ? resp.length : resp?.results?.length ?? 0);
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error: any) => {
            if (error?.status === 401) return false;
            return failureCount < 2;
        },
    });
}

/**
 * Hook para buscar dados de agendamentos
 */
function useAppointmentsData() {
    return useQuery({
        queryKey: ["appointments-data"],
        queryFn: async () => {
            const resp = await apiGet<AppointmentsResponse>("/api/v1/appointments/appointments/");
            const appointments = Array.isArray(resp) ? resp : resp?.results ?? [];

            const totalAppointments = resp?.count ?? appointments.length;
            const criticalAppointments = appointments.filter(
                (a) => a.risk_level === "Crítico"
            ).length;

            return { totalAppointments, criticalAppointments };
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error: any) => {
            if (error?.status === 401) return false;
            return failureCount < 2;
        },
    });
}

/**
 * Hook para buscar alertas críticos
 */
function useCriticalAlerts() {
    return useQuery({
        queryKey: ["critical-alerts"],
        queryFn: async () => {
            const resp = await apiGet<AlertsResponse>("/api/v1/alerts/alerts/");
            const alerts = Array.isArray(resp) ? resp : resp?.results ?? [];

            return alerts.filter((a) => a.risk_level === "critical").length;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error: any) => {
            if (error?.status === 401) return false;
            return failureCount < 2;
        },
    });
}

/**
 * Hook principal para buscar todos os KPIs do gestor
 */
export function useGestorKpis() {
    const { data: totalPatients = 0, isLoading: isLoadingPatients } = usePatientsCount();
    const {
        data: appointmentsData = { totalAppointments: 0, criticalAppointments: 0 },
        isLoading: isLoadingAppointments
    } = useAppointmentsData();
    const { data: criticalAlerts = 0, isLoading: isLoadingAlerts } = useCriticalAlerts();

    const isLoading = isLoadingPatients || isLoadingAppointments || isLoadingAlerts;

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
            value: appointmentsData.criticalAppointments,
            delta: 0,
            accent: "amber",
        },
        {
            key: "appointments",
            label: "Atendimentos",
            value: appointmentsData.totalAppointments,
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
    };
}