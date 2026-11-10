import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";

export interface ConditionsMetrics {
  has_count: number;
  dm_count: number;
  both_count: number;
  has_only: number;
  dm_only: number;
  other_count: number;
  total_with_dcnt: number;
  adherence_rate: number;
}

export interface BloodPressureMetrics {
  controlled: number;
  stage_1_2: number;
  stage_3_critical: number;
  unrecorded: number;
  distribution: {
    NORMAL: number;
    PRE_HIPERTENSO: number;
    HIPERTENSO_E1: number;
    HIPERTENSO_E2: number;
    HIPERTENSO_E3: number;
    NAO_AVALIADO: number;
  };
}

export interface GlycemiaMetrics {
  controlled: number;
  altered: number;
  unrecorded: number;
  treatment_distribution: {
    oral: number;
    insulin: number;
    lifestyle: number;
  };
}

export interface FraminghamMetrics {
  baixo: number;
  moderado: number;
  alto: number;
  nao_avaliado: number;
}

export interface AppointmentsOverviewMetrics {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  critical_risk: number;
  moderate_risk: number;
  safe_risk: number;
}

export interface AlertsOverviewMetrics {
  total_pending: number;
  critical_pending: number;
  moderate_pending: number;
  safe_pending: number;
}

export interface ClinicalPatientSummary {
  id: number;
  name: string;
  cpf: string;
  birth_date?: string | null;
  has_diagnosed: boolean;
  bp_classification: string;
  bp_value?: string | null;
  framingham_score: string;
  dm_diagnosed: boolean;
  dm_screening: string;
  fasting_glycemia?: string | null;
  dm_treatment: string;
  is_critical_bp: boolean;
  is_high_framingham: boolean;
  is_altered_dm: boolean;
  has_comorbidity: boolean;
}

export interface ClinicalAnalyticsResponse {
  total_monitored_patients: number;
  scope: "all" | "my";
  conditions: ConditionsMetrics;
  blood_pressure: BloodPressureMetrics;
  glycemia: GlycemiaMetrics;
  framingham_risk: FraminghamMetrics;
  appointments_overview: AppointmentsOverviewMetrics;
  alerts_overview: AlertsOverviewMetrics;
  patients: ClinicalPatientSummary[];
}

const DEFAULT_ANALYTICS: ClinicalAnalyticsResponse = {
  total_monitored_patients: 0,
  scope: "all",
  patients: [],
  conditions: {
    has_count: 0,
    dm_count: 0,
    both_count: 0,
    has_only: 0,
    dm_only: 0,
    other_count: 0,
    total_with_dcnt: 0,
    adherence_rate: 0,
  },
  blood_pressure: {
    controlled: 0,
    stage_1_2: 0,
    stage_3_critical: 0,
    unrecorded: 0,
    distribution: {
      NORMAL: 0,
      PRE_HIPERTENSO: 0,
      HIPERTENSO_E1: 0,
      HIPERTENSO_E2: 0,
      HIPERTENSO_E3: 0,
      NAO_AVALIADO: 0,
    },
  },
  glycemia: {
    controlled: 0,
    altered: 0,
    unrecorded: 0,
    treatment_distribution: {
      oral: 0,
      insulin: 0,
      lifestyle: 0,
    },
  },
  framingham_risk: {
    baixo: 0,
    moderado: 0,
    alto: 0,
    nao_avaliado: 0,
  },
  appointments_overview: {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    critical_risk: 0,
    moderate_risk: 0,
    safe_risk: 0,
  },
  alerts_overview: {
    total_pending: 0,
    critical_pending: 0,
    moderate_pending: 0,
    safe_pending: 0,
  },
};

export function useClinicalAnalytics(scope: "all" | "my" = "all") {
  const { data, isLoading, isError, refetch } =
    useQuery<ClinicalAnalyticsResponse>({
      queryKey: ["clinical-analytics", scope],
      queryFn: async () => {
        try {
          const resp = await apiGet<ClinicalAnalyticsResponse>(
            `/api/v1/reports/clinical-analytics/?scope=${scope}`,
          );

          if (resp && typeof resp.total_monitored_patients === "number") {
            return resp;
          }

          return DEFAULT_ANALYTICS;
        } catch {
          return DEFAULT_ANALYTICS;
        }
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 min
      retry: false,
    });

  return {
    data: data ?? DEFAULT_ANALYTICS,
    isLoading,
    isError,
    refetch,
  };
}
