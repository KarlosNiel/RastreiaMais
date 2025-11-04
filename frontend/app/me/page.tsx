// app/me/page.tsx
"use client";

import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  ConsultasTable,
  type ConsultaRow,
} from "@/components/portal/ConsultasTable";
import { AccentSection } from "@/components/ui/AccentSection";
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

// ...existing code...

/* ===== Mock de KPIs e Medicações (trocar por API) ===== */
const KPIS = [
  {
    key: "pa",
    label: "Sua Pressão Arterial",
    value: "141x89 mmHg",
    delta: -0.8, // número, não string
    accent: "amber" as const, // "amber" é aceito pelo KpiCard
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path fill="currentColor" d="M13 5V3h-2v2H8v6h2v10h4V11h2V5h-3z" />
      </svg>
    ),
  },
  {
    key: "risco",
    label: "Risco Cardiovascular",
    value: "Moderado",
    delta: 0, // quando não houver variação, use 0
    accent: "amber" as const,
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path
          fill="currentColor"
          d="M12 21s-6-4.35-8.485-6.836A6 6 0 0 1 12 4a6 6 0 0 1 8.485 10.164C18 16.65 12 21 12 21z"
        />
      </svg>
    ),
  },
  {
    key: "hdl",
    label: "Colesterol Bom (HDL)",
    value: "37 mg/dl",
    delta: 1.3,
    accent: "green" as const,
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path
          fill="currentColor"
          d="M3 13h18v2H3v-2zM3 17h12v2H3v-2zM3 9h18v2H3V9z"
        />
      </svg>
    ),
  },
  {
    key: "ldl",
    label: "Colesterol Ruim (LDL)",
    value: "150 mg/dl",
    delta: -2.2,
    accent: "blue" as const,
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path fill="currentColor" d="M3 5h18v4H3V5zm0 6h18v8H3v-8z" />
      </svg>
    ),
  },
] as const;

type Med = { id: string; nome: string; obs?: string };
const MEDICACOES: Med[] = [
  {
    id: "m1",
    nome: "Hidroclorotiazida",
    obs: "Tomar duas doses ao dia, 1 comprimido de manhã e outro à noite.",
  },
  {
    id: "m2",
    nome: "Hidroclorotiazida",
    obs: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "m3",
    nome: "Hidroclorotiazida",
    obs: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "m4",
    nome: "Hidroclorotiazida",
    obs: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "m5",
    nome: "Hidroclorotiazida",
    obs: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "m6",
    nome: "Hidroclorotiazida",
    obs: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

/* ===== Mock de Consultas (substituído por chamada à API) ===== */
/* Mantive APPTS apenas para fallback local se a API falhar */
const APPTS: ConsultaRow[] = [
  {
    id: "a1",
    profissional: "Fernanda",
    cargo: "Enfermeira",
    local: "USF Maria Madalena",
    hora: "16:00",
    data: "11/09/25",
    status: "ativo",
  },
  {
    id: "a2",
    profissional: "Fernanda",
    cargo: "Enfermeira",
    local: "USF Maria Madalena",
    hora: "16:00",
    data: "11/09/25",
    status: "cancelado",
  },
  {
    id: "a3",
    profissional: "Fernanda",
    cargo: "Enfermeira",
    local: "USF Maria Madalena",
    hora: "16:00",
    data: "11/09/25",
    status: "finalizado",
  },
  {
    id: "a4",
    profissional: "Fernanda",
    cargo: "Enfermeira",
    local: "USF Maria Madalena",
    hora: "16:00",
    data: "11/09/25",
    status: "finalizado",
  },
  {
    id: "a5",
    profissional: "Fernanda",
    cargo: "Enfermeira",
    local: "USF Maria Madalena",
    hora: "16:00",
    data: "11/09/25",
    status: "ativo",
  },
  {
    id: "a6",
    profissional: "Fernanda",
    cargo: "Enfermeira",
    local: "USF Maria Madalena",
    hora: "16:00",
    data: "11/09/25",
    status: "ativo",
  },
];

export default function MePage() {
  const meds = useMemo(() => MEDICACOES, []);

  // useQuery para buscar consultas da API
const { data, isLoading, isError, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/appointments/appointments/");
      if (Array.isArray(resp)) return resp;
      if (resp && Array.isArray(resp.results)) return resp.results;
      return [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutos para evitar muitas requisições
    retry: (failureCount, error: any) => {
      // Não tentar novamente se for erro 401 (não autorizado)
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
});

  // transformar resposta da API para o tipo esperado pelo ConsultasTable
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
        id: String(a.id ?? a.pk ?? Math.random().toString(36).slice(2, 9)),
        profissional,
        cargo,
        local,
        hora: horaStr,
        data: dataStr,
        status,
      } as ConsultaRow;
    });
  }, [data]);

  return (
    <>
      {/* Header */}
      <header className="flex flex-col gap-2 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Paciente Gustavo, 55 anos
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Hipertensão Arterial Sistêmica (HAS)
            <span aria-hidden> ▾</span>
          </p>
        </div>
      </header>

      {/* Linha 1: KPIs + Medicações */}
      <section
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch"
        aria-labelledby="sec-kpis-meds"
      >
        <h2 id="sec-kpis-meds" className="sr-only">
          Indicadores e Medicações
        </h2>

        {/* KPIs 2x2 */}
        <div className="min-h-0">
          <div className="grid h-full grid-cols-1 grid-rows-2 gap-3 md:grid-cols-2">
            {KPIS.map((kpi) => (
              <div key={kpi.key} className="h-full">
                <KpiCard
                  label={kpi.label}
                  value={kpi.value}
                  delta={kpi.delta}
                  accent={kpi.accent}
                  icon={kpi.icon}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Medicações Atuais */}
        <AccentSection
          className="flex h-full flex-col"
          accent="blue"
          title={
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-indigo-600"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M19 3H5a2 2 0 0 0-2 2v3h18V5a2 2 0 0 0-2-2Zm-9 7H3v9a2 2 0 0 0 2 2h5v-11Zm2 0v11h7a2 2 0 0 0 2-2v-9h-9Z"
                />
              </svg>
              Medicações Atuais
            </span>
          }
          contentClassName="p-0"
        >
          <div
            className="max-h-80 overflow-auto p-4"
            role="region"
            aria-label="Lista de medicações atuais"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {meds.map((m) => (
                <article
                  key={m.id}
                  className="rounded-xl border border-divider bg-content1 p-4"
                >
                  <h3 className="text-[15px] font-semibold">{m.nome}</h3>
                  {m.obs && (
                    <p className="mt-1 text-sm text-foreground/60">{m.obs}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </AccentSection>
      </section>

      {/* Linha 2: Suas Consultas */}
      <AccentSection
        className="mt-6"
        accent="green"
        title={
          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="size-5 text-emerald-600"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z"
              />
            </svg>
            Suas Consultas
          </span>
        }
      >
        {isLoading ? (
          <div className="p-6">Carregando consultas...</div>
        ) : isError ? (
          <div className="p-6 text-red-600">Erro ao carregar consultas.</div>
        ) : (
          <ConsultasTable rows={rows} initialPage={1} initialRowsPerPage={4} />
        )}
      </AccentSection>
    </>
  );
}