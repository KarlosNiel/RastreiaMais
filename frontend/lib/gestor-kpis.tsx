import {
  UsersIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

export type KpiKey =
  | "totalPatients"
  | "atRisk"
  | "appointments"
  | "criticalAlerts";

export type KpiDTO = {
  key: KpiKey;
  label: string;
  value: number;
  delta?: number;
  accent: any;
};

export async function getGestorKpis(): Promise<KpiDTO[]> {
  // Troque por fetch da sua API quando tiver (ex:
  // await fetch(`${process.env.API_URL}/gestor/kpis`, { cache: 'no-store' }))
  return [
    {
      key: "totalPatients",
      label: "Pacientes Totais",
      value: 1309,
      delta: +2,
      accent: "brand",
    },
    {
      key: "atRisk",
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
      delta: 0,
      accent: "red",
    },
  ];
}

export const KPI_ICONS: Record<KpiKey, React.ReactNode> = {
  totalPatients: <UsersIcon className="size-5 text-current stroke-orange-600" />,
  atRisk: <ExclamationTriangleIcon className="size-5 text-current stroke-orange-600" />,
  appointments: <CalendarDaysIcon className="size-5 text-current stroke-orange-600" />,
  criticalAlerts: <BellAlertIcon className="size-5 text-current stroke-orange-600" />,
};
