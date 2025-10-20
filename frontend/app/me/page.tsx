// app/me/page.tsx
"use client";

import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  ConsultasTable,
  type ConsultaRow,
} from "@/components/portal/ConsultasTable";
import { AccentSection } from "@/components/ui/AccentSection";
import { useMemo } from "react";

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

/* ===== Mock de Consultas ===== */
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
        <ConsultasTable rows={APPTS} initialPage={1} initialRowsPerPage={4} />
      </AccentSection>
    </>
  );
}
