// frontend/app/gestor/page.tsx

import { KpiCard } from "@/components/dashboard/KpiCard";
import { PendenciasTable } from "@/components/gestor/PendenciasTable";
import { ProfissionaisTable } from "@/components/gestor/ProfissionaisTable";
import { AccentSection } from "@/components/ui/AccentSection";
import { RMButton } from "@/components/ui/RMButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { getGestorKpis, KPI_ICONS } from "@/lib/gestor-kpis";

/* =========== helpers de tom/estilo =========== */
type RiskTone = "safe" | "moderate" | "critical";

// mapeia risco → tom do StatusChip (figma: Seguro / Atenção / Crítico)
const mapRiskToChip = (t: RiskTone): "safe" | "attention" | "critical" =>
  t === "moderate" ? "attention" : t;

// classe da barrinha à esquerda nos cards de alerta
const alertLeftBar = (t: RiskTone) =>
  t === "critical"
    ? "border-l-4 border-l-rose-500"
    : t === "moderate"
      ? "border-l-4 border-l-amber-400"
      : "border-l-4 border-l-emerald-500";

// anel do avatar nos alertas (segue a cor do risco)
const avatarRing = (t: RiskTone) =>
  t === "critical"
    ? "ring-rose-300"
    : t === "moderate"
      ? "ring-amber-300"
      : "ring-emerald-300";

/* ===================== Página ===================== */
export default async function Page() {
  // KPIs agora vêm da camada de dados (pronto para trocar por fetch de API)
  const KPIS = await getGestorKpis();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Dashboard do Gestor
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Visão geral da APS •{" "}
            <span className="font-medium">Microárea: Todas</span>
          </p>
        </div>
      </div>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      </section>

      {/* Gráfico + Alertas */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* DCNTs por Microárea */}
        <AccentSection
          title={
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-5 text-sky-600">
                <path
                  fill="currentColor"
                  d="M3 13h2v-2H3v2zm4 0h2V7H7v6zm4 0h2V3h-2v10zm4 0h2V9h-2v4zm4 0h2V5h-2v8z"
                />
              </svg>
              DCNTs por Microárea
            </span>
          }
          accent="blue"
          className="lg:col-span-2"
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
          {/* placeholder do gráfico */}
          <div className="h-72 rounded-xl bg-content2" />
        </AccentSection>

        {/* Alertas Recentes */}
        <AccentSection
          title="Alertas Recentes"
          accent="brand"
          right={
            <RMButton
              look="soft"
              tone="neutral"
              size="sm"
              aria-label="Adicionar alerta"
            >
              +
            </RMButton>
          }
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
                className={`flex items-center justify-between gap-4 rounded-xl border border-divider bg-content1 p-3 shadow-soft ${alertLeftBar(a.tone)}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid size-10 place-items-center rounded-full ring-2 ${avatarRing(a.tone)} bg-content2`}
                  >
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
                    <div className="text-[12px] text-foreground/60">
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

      {/* Pendências */}
      <AccentSection title="Pendências" accent="amber" className="mt-6">
        <PendenciasTable
          rows={[
            {
              id: "1",
              paciente: "Fernanda",
              pendencias: "Medição PA",
              dias: 64,
              microarea: "Jardim Magnólia",
              risco: "safe",
            },
            {
              id: "2",
              paciente: "Fernanda",
              pendencias: "Enfermeira",
              dias: 55,
              microarea: "Jardim Magnólia",
              risco: "safe",
            },
            {
              id: "3",
              paciente: "Fernanda",
              pendencias: "Enfermeira",
              dias: 43,
              microarea: "Jardim Magnólia",
              risco: "moderate",
            },
            {
              id: "4",
              paciente: "Fernanda",
              pendencias: "Enfermeira",
              dias: 42,
              microarea: "Jardim Magnólia",
              risco: "critical",
            },
          ]}
          initialPage={1}
          initialRowsPerPage={6}
        />
      </AccentSection>

      {/* Profissionais */}
      <AccentSection title="Profissionais" accent="green" className="mt-6">
        <ProfissionaisTable
          rows={[
            {
              id: "p1",
              profissional: "Fernanda",
              cargo: "Enfermeira",
              local: "USF Maria Madalena",
              status: "Ativo",
            },
            {
              id: "p2",
              profissional: "Fernanda",
              cargo: "Enfermeira",
              local: "USF Maria Madalena",
              status: "Ativo",
            },
            {
              id: "p3",
              profissional: "Fernanda",
              cargo: "Enfermeira",
              local: "USF Maria Madalena",
              status: "Licença",
            },
            {
              id: "p4",
              profissional: "Fernanda",
              cargo: "Enfermeira",
              local: "USF Maria Madalena",
              status: "Afastado",
            },
          ]}
          initialPage={1}
          initialRowsPerPage={6}
        />
      </AccentSection>
    </>
  );
}
