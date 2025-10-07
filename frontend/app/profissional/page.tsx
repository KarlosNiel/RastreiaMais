// app/profissional/page.tsx
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  AgendaTable,
  type AgendaRow,
} from "@/components/profissional/AgendaTable";
import { AccentSection } from "@/components/ui/AccentSection";
import { StatusChip } from "@/components/ui/StatusChip";
import { getProfissionalKpis, KPI_ICONS } from "@/lib/profissional-kpis";

/* Helpers */
type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";
const mapRiskToChip = (t: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : t;
const alertLeftBar = (t: RiskTone) =>
  t === "critical"
    ? "border-l-4 border-l-rose-500"
    : t === "moderate"
      ? "border-l-4 border-l-amber-400"
      : "border-l-4 border-l-emerald-500";

export default async function ProfissionalPage() {
  const KPIS = await getProfissionalKpis();

  // Fonte única de verdade para a Agenda
  const AGENDA_ROWS: AgendaRow[] = [
    {
      id: "a1",
      paciente: "João S.",
      docMasked: "****1234",
      condicao: "HAS",
      hora: "08:30",
      local: "UBS",
      risco: "safe",
    },
    {
      id: "a2",
      paciente: "Maria C.",
      docMasked: "****4321",
      condicao: "DM",
      hora: "10:00",
      local: "UBS",
      risco: "safe",
    },
    {
      id: "a3",
      paciente: "Charles O.",
      docMasked: "****5678",
      condicao: "HAS/DM",
      hora: "14:00",
      local: "Visita",
      risco: "moderate",
    },
    {
      id: "a4",
      paciente: "Charles O.",
      docMasked: "****5678",
      condicao: "HAS/DM",
      hora: "16:30",
      local: "Visita",
      risco: "critical",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Dashboard Profissional
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Visão geral da APS •{" "}
            <span className="font-medium">Microárea: Jardim Magnólia</span>
          </p>
        </div>
      </div>

      {/* ===== Linha 1: KPIs + Alertas ===== */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* KPIs (metade esquerda) */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {KPIS.map((kpi) => (
              <KpiCard
                key={kpi.key}
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                accent={kpi.accent}
                icon={KPI_ICONS[kpi.key]}
              />
            ))}
          </div>
        </div>

        {/* Alertas Recentes (metade direita) */}
        <AccentSection
          className="h-full"
          title="Alertas Recentes"
          accent="brand"
        >
          <ul className="space-y-3">
            {[
              {
                nome: "Maria C.",
                id: "****4321",
                cond: "HAS",
                quando: "30 min",
                tone: "critical" as RiskTone,
              },
              {
                nome: "José A.",
                id: "****1234",
                cond: "HAS",
                quando: "30 min",
                tone: "safe" as RiskTone,
              },
              {
                nome: "Ana L.",
                id: "****5678",
                cond: "HAS/DM",
                quando: "2 hr",
                tone: "moderate" as RiskTone,
              },
              {
                nome: "Clara M.",
                id: "****4312",
                cond: "HAS",
                quando: "4 hr",
                tone: "safe" as RiskTone,
              },
            ].map((a, i) => (
              <li
                key={i}
                className={`flex items-center justify-between gap-4 rounded-xl border border-divider bg-content1 p-4 ${alertLeftBar(a.tone)}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-divider bg-content2">
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold">
                      {a.nome}{" "}
                      <span className="text-foreground/60">{a.id}</span>
                    </div>
                    <div className="text-sm text-foreground/60">
                      Condição: {a.cond} · Atualizado: {a.quando}
                    </div>
                  </div>
                </div>
                <StatusChip size="sm" tone={mapRiskToChip(a.tone)}>
                  {a.tone === "critical"
                    ? "Crítico"
                    : a.tone === "moderate"
                      ? "Atenção"
                      : "Seguro"}
                </StatusChip>
              </li>
            ))}
          </ul>
        </AccentSection>
      </section>

      {/* ===== Linha 2: Gráfico + Registros Pendentes ===== */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* DCNTs por Microárea */}
        <AccentSection
          accent="blue"
          className="lg:col-span-2"
          title={
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-indigo-600"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M3 13h2v-2H3v2zm4 0h2V7H7v6zm4 0h2V3h-2v10zm4 0h2V9h-2v4zm4 0h2V5h-2v8z"
                />
              </svg>
              DCNTs por Microárea
            </span>
          }
          right={
            <div className="flex items-center gap-2 text-sm">
              <StatusChip size="sm" tone="neutral">
                Todas as Microáreas ▾
              </StatusChip>
              <StatusChip size="sm" tone="neutral">
                HAS ▾
              </StatusChip>
              <StatusChip size="sm" tone="neutral">
                2025 ▾
              </StatusChip>
            </div>
          }
          contentClassName="space-y-0"
        >
          <div
            className="h-72 rounded-xl bg-content2"
            role="img"
            aria-label="Gráfico DCNTs por microárea"
          />
          <div className="mt-3 flex gap-4 text-xs text-foreground/60">
            <span className="inline-flex items-center gap-1">
              <i className="size-2 rounded-[2px] bg-indigo-600" /> HAS
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="size-2 rounded-[2px] bg-orange-500" /> DM
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="size-2 rounded-[2px] bg-amber-400" /> HAS+DM
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="size-2 rounded-[2px] bg-emerald-500" /> Outros
            </span>
          </div>
        </AccentSection>

        {/* Registros Pendentes */}
        <AccentSection title="Registros Pendentes" accent="green">
          <ul className="space-y-3">
            {[
              {
                n: "Maria C.",
                id: "****4321",
                pend: "Dados · endereço, cidade, UF, escolaridade, idade, telefone…",
              },
              { n: "João S.", id: "****1234", pend: "PA · HDL, LDL" },
              {
                n: "José A.",
                id: "****9765",
                pend: "Dados · endereço, cidade, UF, escolaridade, idade, telefone…",
              },
              {
                n: "Carlos D.",
                id: "****3399",
                pend: "Dados · endereço, cidade, UF, escolaridade, idade, telefone…",
              },
            ].map((r, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-4 rounded-xl border border-divider bg-content1 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-divider bg-content2">
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold">
                      {r.n} <span className="text-foreground/60">{r.id}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-foreground/60">
                      {r.pend}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </AccentSection>
      </section>

      {/* ===== Linha 3: Agenda ===== */}
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
            Agenda
          </span>
        }
      >
        <AgendaTable
          rows={AGENDA_ROWS}
          enableToolbar
          initialPage={1}
          initialRowsPerPage={8}
        />
      </AccentSection>
    </>
  );
}
