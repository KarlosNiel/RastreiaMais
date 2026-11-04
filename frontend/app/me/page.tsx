"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

import { apiGet } from "@/lib/api";
import { useHasData } from "@/lib/hooks/paciente/useHasData";
import { useMedications } from "@/lib/hooks/paciente/useMedications";
import { useMe } from "@/lib/hooks/me/useMe";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  ConsultasTable,
  type ConsultaRow,
} from "@/components/portal/ConsultasTable";
import PatientAppointmentDetailsModal from "@/components/me/PatientAppointmentDetailsModal";

export default function MePage() {
  const { data: me, isLoading: isLoadingMe } = useMe();
  const { data: meds = [], isLoading: isLoadingMeds } = useMedications();
  const [selected, setSelected] = useState<ConsultaRow | null>(null);
  const [open, setOpen] = useState(false);

  // Busca dados de HAS
  const { data: hasData, isLoading: isLoadingHas } = useHasData();

  function handleView(dados: ConsultaRow) {
    setSelected(dados);
    setOpen(true);
  }

  // Busca consultas
  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/appointments/appointments/");

      if (Array.isArray(resp)) return resp;

      return resp?.results ?? [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;

      return failureCount < 3;
    },
  });

  //! Monta KPIs dinâmicos baseado nos dados da API
  const KPIS = useMemo(() => {
    if (!hasData) return [];

    const accentMap = {
      green: "green" as const,
      amber: "amber" as const,
      orange: "amber" as const,
      red: "red" as const,
    };

    return [
      {
        key: "pa",
        label: "Sua Pressão Arterial",
        value: hasData.pressaoArterial,
        delta: hasData.deltaPA,
        accent: hasData.deltaPA < 0 ? ("amber" as const) : ("green" as const),
        icon: <ChartBarIcon className="size-5" />,
      },
      {
        key: "risco",
        label: "Risco Cardiovascular",
        value: hasData.riscoCardiovascular,
        delta: 0,
        accent: accentMap[hasData.riscoColor],
        icon: <ShieldExclamationIcon className="size-5" />,
      },
      {
        key: "hdl",
        label: "Colesterol Bom (HDL)",
        value: hasData.colesterolHDL,
        delta: hasData.deltaHDL,
        accent: hasData.deltaHDL > 0 ? ("green" as const) : ("amber" as const),
        icon: <HeartIcon className="size-5" />,
      },
      {
        key: "ldl",
        label: "Colesterol Ruim (LDL)",
        value: hasData.colesterolLDL,
        delta: hasData.deltaLDL,
        accent: hasData.deltaLDL < 0 ? ("green" as const) : ("red" as const),
        icon: <ExclamationTriangleIcon className="size-5" />,
      },
    ];
  }, [hasData]);

  const rows = useMemo<ConsultaRow[]>(() => {
    if (!data) return [];

    return data.map((a: any) => {
      const profissional =
        `${a.professional?.user?.first_name ?? ""} ${a.professional?.user?.last_name ?? ""}`.trim();
      const cargo = a.professional?.role ?? "—";
      const local = a.location?.name ?? a.local?.name ?? "—";

      const dt = a.scheduled_datetime ?? null;

      let dataStr = "—";
      let horaStr = "—";

      if (dt) {
        const d = new Date(dt);

        if (!Number.isNaN(d.getTime())) {
          dataStr = d.toLocaleDateString("pt-BR");
          horaStr = d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          dataStr = String(dt);
        }
      } else {
        if (a.date) dataStr = String(a.date);
        if (a.time) horaStr = String(a.time);
      }

      const tipo = a.type ?? "-";

      const status = a.status ?? "ativo";

      return {
        id: String(a.id ?? a.pk ?? crypto.randomUUID()),
        profissional,
        cargo,
        local,
        data: dataStr,
        hora: horaStr,
        tipo,
        status,
      };
    });
  }, [data]);

  //! Formatar nome do paciente
  const patientName = useMemo(() => {
    if (!me?.user) return "Paciente";
    const firstName = me.user.first_name || "";
    const lastName = me.user.last_name || "";

    return (
      `Paciente: ${firstName} ${lastName}`.trim() ||
      me.user.username ||
      "Paciente"
    );
  }, [me]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Header */}
      <header className="flex flex-col gap-2 pt-8 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          {isLoadingMe ? (
            <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-md" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
              {patientName}
            </h1>
          )}
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Acompanhamento Clínico &bull;{" "}
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Hipertensão Arterial Sistêmica (HAS)
            </span>
          </p>
        </div>
      </header>

      <section className="mt-4">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingHas ? (
            <div className="col-span-full p-8 text-center text-slate-500 dark:text-zinc-400">
              Carregando dados clínicos...
            </div>
          ) : KPIS.length > 0 ? (
            KPIS.map(({ key, ...kpi }) => <KpiCard key={key} {...kpi} />)
          ) : (
            <div className="col-span-full p-8 text-center text-slate-500 dark:text-zinc-400">
              Nenhum dado clínico disponível.
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDaysIcon className="size-5 text-slate-600 dark:text-zinc-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Suas Consultas
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-500 dark:text-zinc-400">
            Carregando consultas...
          </div>
        ) : isError ? (
          <div className="p-6 text-red-600 dark:text-red-400">
            Erro ao carregar consultas.
          </div>
        ) : (
          <ConsultasTable
            className="rounded-lg overflow-hidden"
            initialPage={1}
            initialRowsPerPage={4}
            rows={rows}
            onView={handleView}
          />
        )}

        <PatientAppointmentDetailsModal
          data={selected}
          open={open}
          onClose={() => setOpen(false)}
        />
      </section>
    </div>
  );
}
