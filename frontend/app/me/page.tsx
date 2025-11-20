// app/me/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useHasData } from "@/lib/hooks/paciente/useHasData";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { ConsultasTable, type ConsultaRow } from "@/components/portal/ConsultasTable";

import {
  HeartIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import PatientAppointmentDetailsModal from "@/components/me/PatientAppointmentDetailsModal";

/* ===== Mock de Medicações ===== */
const MEDICACOES = [
  { id: "m1", nome: "Hidroclorotiazida", obs: "Tomar duas doses ao dia, 1 comprimido de manhã e outro à noite." },
  { id: "m2", nome: "Losartana", obs: "Tomar 1 comprimido pela manhã." },
  { id: "m3", nome: "Atorvastatina", obs: "Tomar 1 comprimido à noite antes de dormir." },
];

export default function MePage() {
  const meds = useMemo(() => MEDICACOES, []);
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

  // Monta KPIs dinâmicos baseado nos dados da API
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
        accent: hasData.deltaPA < 0 ? "amber" as const : "green" as const,
        icon: <ChartBarIcon className="h-5 w-5 stroke-orange-600" />,
      },
      {
        key: "risco",
        label: "Risco Cardiovascular",
        value: hasData.riscoCardiovascular,
        delta: 0,
        accent: accentMap[hasData.riscoColor],
        icon: <ShieldExclamationIcon className="h-5 w-5 stroke-orange-600" />,
      },
      {
        key: "hdl",
        label: "Colesterol Bom (HDL)",
        value: hasData.colesterolHDL,
        delta: hasData.deltaHDL,
        accent: hasData.deltaHDL > 0 ? "green" as const : "amber" as const,
        icon: <HeartIcon className="h-5 w-5 stroke-orange-600" />,
      },
      {
        key: "ldl",
        label: "Colesterol Ruim (LDL)",
        value: hasData.colesterolLDL,
        delta: hasData.deltaLDL,
        accent: hasData.deltaLDL < 0 ? "green" as const : "red" as const,
        icon: <ExclamationTriangleIcon className="h-5 w-5 stroke-orange-600" />,
      },
    ];
  }, [hasData]);

  const rows = useMemo<ConsultaRow[]>(() => {
    if (!data) return [];

    return data.map((a: any) => {
      const profissional = `${a.professional?.user?.first_name ?? ""} ${a.professional?.user?.last_name ?? ""}`.trim();
      const cargo = a.professional?.role ?? "—";
      const local = a.location?.name ?? a.local?.name ?? "—";

      const dt = a.scheduled_datetime ?? null;

      let dataStr = "—";
      let horaStr = "—";

      if (dt) {
        const d = new Date(dt);
        if (!Number.isNaN(d.getTime())) {
          dataStr = d.toLocaleDateString("pt-BR");
          horaStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } else {
          dataStr = String(dt);
        }
      } else {
        if (a.date) dataStr = String(a.date);
        if (a.time) horaStr = String(a.time);
      }

      const status = a.status ?? "ativo";

      return {
        id: String(a.id ?? a.pk ?? crypto.randomUUID()),
        profissional,
        cargo,
        local,
        data: dataStr,
        hora: horaStr,
        status,
      };
    });
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Header */}
      <header className="flex flex-col gap-2 pt-8 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl dark:text-white">
            Paciente Gustavo, 55 anos
          </h1>
          <p className="mt-1 text-sm text-foreground/60 dark:text-white">
            Hipertensão Arterial Sistêmica (HAS) <span aria-hidden>▾</span>
          </p>
        </div>
      </header>

      {/* KPIs + Medicações */}
      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:col-span-2">
          {isLoadingHas ? (
            <div className="col-span-2 p-6 text-center text-gray-500 dark:text-gray-400">
              Carregando dados clínicos...
            </div>
          ) : KPIS.length > 0 ? (
            KPIS.map(({ key, ...kpi }) => (
              <KpiCard
                key={key}
                {...kpi}
                footerText="Seus dados atualizados com as informações mais recentes."
              />
            ))
          ) : (
            <div className="col-span-2 p-6 text-center text-gray-500 dark:text-gray-400">
              Nenhum dado clínico disponível.
            </div>
          )}
        </div>

        {/* Medicações */}
        <div className="rounded-md bg-white dark:bg-gray-900 shadow-sm border border-transparent dark:border-gray-800 p-4 transition-all md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Medicações Atuais
            </h2>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 pr-2">
            {meds.map((m) => (
              <article
                key={m.id}
                className="rounded-md border border-gray-200 dark:border-gray-800 p-4 
                          bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
              >
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {m.nome}
                </h3>
                {m.obs && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{m.obs}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Consultas */}
      <section className="mt-6 rounded-md bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm p-4 w-full transition-all">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Suas Consultas
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">Carregando consultas...</div>
        ) : isError ? (
          <div className="p-6 text-red-600 dark:text-red-400">Erro ao carregar consultas.</div>
        ) : (
          <ConsultasTable
            rows={rows}
            initialPage={1}
            onView={handleView}
            initialRowsPerPage={4}
            className="rounded-md overflow-hidden"
          />
        )}

        <PatientAppointmentDetailsModal
          open={open}
          onClose={() => setOpen(false)}
          data={selected}
        />
      </section>
    </div>
  );
}