// app/me/page.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

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

/* ===== Mock de KPIs e Medicações ===== */
const KPIS = [
  { key: "pa", label: "Sua Pressão Arterial", value: "141x89 mmHg", delta: -0.8, accent: "amber" as const, icon: <ChartBarIcon className="h-5 w-5 stroke-orange-600" /> },
  { key: "risco", label: "Risco Cardiovascular", value: "Moderado", delta: 0, accent: "amber" as const, icon: <ShieldExclamationIcon className="h-5 w-5 stroke-orange-600" /> },
  { key: "hdl", label: "Colesterol Bom (HDL)", value: "37 mg/dl", delta: 1.3, accent: "green" as const, icon: <HeartIcon className="h-5 w-5 stroke-orange-600" /> },
  { key: "ldl", label: "Colesterol Ruim (LDL)", value: "150 mg/dl", delta: -2.2, accent: "blue" as const, icon: <ExclamationTriangleIcon className="h-5 w-5 stroke-orange-600" /> },
];

const MEDICACOES = [
  { id: "m1", nome: "Hidroclorotiazida", obs: "Tomar duas doses ao dia, 1 comprimido de manhã e outro à noite." },  
  { id: "m2", nome: "Losartana", obs: "Tomar 1 comprimido pela manhã." },
  { id: "m3", nome: "Atorvastatina", obs: "Tomar 1 comprimido à noite antes de dormir." },
  { id: "m4", nome: "Atorvastatina", obs: "Tomar 1 comprimido à noite antes de dormir." }
];

const APPTS: ConsultaRow[] = [
  { id: "a1", profissional: "Fernanda", cargo: "Enfermeira", local: "USF Maria Madalena", hora: "16:00", data: "11/09/25", status: "ativo" },
  { id: "a2", profissional: "João", cargo: "Médico", local: "USF Maria Madalena", hora: "10:00", data: "15/09/25", status: "finalizado" },
];

export default function MePage() {
  const meds = useMemo(() => MEDICACOES, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/appointments/appointments/");
      if (Array.isArray(resp)) return resp;
      return resp?.results ?? [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutos para evitar muitas requisições
    retry: (failureCount, error: any) => {
      // Não tentar novamente se for erro 401 (não autorizado)
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
});

  const rows = useMemo<ConsultaRow[]>(() => {
    const source = (data ?? APPTS) as any[];
    return source.map((a) => {
      // mapeamento defensivo com vários fallbacks para evitar erros
      const profissional =
        a.professional?.user?.first_name ?? "—";

      const cargo =
        a.professional?.role ??
        "—";

      const local =
        a.location?.name ?? a.local?.name ?? "—";

      // tentamos extrair data/hora a partir de campos comuns usados em APIs
      const dt =
        a.scheduled_datetime ??
        null;

      let dataStr = "—";
      let horaStr = "—";
      if (dt) {
        const d = new Date(dt);
        if (!Number.isNaN(d.getTime())) {
          dataStr = d.toLocaleDateString();
          horaStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else {
          // se não for uma string de data válida, exiba como está
          dataStr = String(dt);
        }
      } else {
        // campos separados:
        if (a.scheduled_datetime) dataStr = String(a.date);
        if (a.scheduled_datetime) horaStr = String(a.hora);
      }

      const status = a.status;

      return {
        id: String(a.id ?? a.pk ?? crypto.randomUUID()),
        profissional: profissional,
        cargo: cargo,
        local: local,
        data: dataStr,
        hora: horaStr,
        status: status ?? "—",
      };
    });
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-2 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl dark:text-white">Paciente Gustavo, 55 anos</h1>
          <p className="mt-1 text-sm text-foreground/60 dark:text-white">
            Hipertensão Arterial Sistêmica (HAS) <span aria-hidden>▾</span>
          </p>
        </div>
      </header>

      {/* KPIs + Medicações */}
      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:col-span-2">
          {KPIS.map(({ key, ...kpi }) => (
            <KpiCard key={key} {...kpi} />
          ))}
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
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {m.obs}
                  </p>
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
            initialRowsPerPage={4}
            className="rounded-md overflow-hidden"
          />
        )}
      </section>
    </div>
  );
}
