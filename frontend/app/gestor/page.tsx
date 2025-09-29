// frontend/app/gestor/page.tsx

import { AccentSection } from "@/components/ui/AccentSection";
import { RMButton } from "@/components/ui/RMButton";

/* =========== UI primitives (chips/badges) =========== */
function Chip({
  tone = "neutral",
  size = "md",
  children,
  className = "",
}: {
  tone?: "safe" | "moderate" | "critical" | "neutral" | "info" | "brand";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    brand:
      "text-[var(--brand)] border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[color-mix(in_oklab,var(--brand)_10%,transparent)]",
    safe: "text-risk-safe border-risk-safe/30 bg-risk-safe/10",
    moderate: "text-risk-moderate border-risk-moderate/30 bg-risk-moderate/10",
    critical: "text-risk-critical border-risk-critical/30 bg-risk-critical/10",
    info: "text-foreground border-foreground/25 bg-foreground/[6%]",
    neutral: "text-foreground border-foreground/20 bg-content2",
  } as const;
  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px] rounded-full",
    md: "px-3 py-1 text-[12px] rounded-full",
  } as const;

  return (
    <span
      className={`inline-flex items-center border ${sizes[size]} ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ===================== KPIs ===================== */
function KpiCard({
  label,
  value,
  delta,
  icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  delta?: number;
  icon?: React.ReactNode;
  accent?: "brand" | "blue" | "amber" | "green" | "red";
}) {
  const deltaTone =
    typeof delta !== "number"
      ? "neutral"
      : delta > 0
        ? "critical"
        : delta < 0
          ? "safe"
          : "neutral";

  const accentColor =
    accent === "blue"
      ? "bg-sky-500"
      : accent === "amber"
        ? "bg-amber-500"
        : accent === "green"
          ? "bg-emerald-500"
          : accent === "red"
            ? "bg-rose-500"
            : "bg-[var(--brand)]";

  return (
    <div className="relative rounded-2xl border border-divider bg-content1 p-5 shadow-soft min-h-[132px]">
      {/* filete à esquerda */}
      <span
        className={`absolute inset-y-0 left-0 w-[6px] rounded-l-2xl ${accentColor}`}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-foreground/70">{label}</div>
        {icon ? (
          <div className="grid size-8 place-items-center rounded-xl bg-content2 text-foreground/70">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        {typeof delta === "number" && (
          <Chip tone={deltaTone as any} size="sm">
            {delta > 0 ? `+${delta}` : delta}
          </Chip>
        )}
      </div>

      <p className="mt-2 text-[12px] text-foreground/60">
        Aumento/diminuição em relação ao mês anterior
      </p>
    </div>
  );
}

/* ===================== Página ===================== */
export default function Page() {
  // mocks só para demonstração (mantidos)
  const KPIS = [
    {
      label: "Pacientes Totais",
      value: 1309,
      delta: +2,
      accent: "brand" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="currentColor"
            d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 1.67-8 5v1h16v-1c0-3.33-3.67-5-8-5Z"
          />
        </svg>
      ),
    },
    {
      label: "Pacientes em Risco",
      value: 24,
      delta: -1,
      accent: "amber" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2 1 21h22L12 2Zm1 14h-2v-2h2v2Zm0-4h-2V8h2v4Z"
          />
        </svg>
      ),
    },
    {
      label: "Atendimentos",
      value: 84,
      delta: +11,
      accent: "blue" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="currentColor"
            d="M19 3H5a2 2 0 0 0-2 2v12l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
          />
        </svg>
      ),
    },
    {
      label: "Alertas Críticos",
      value: 2,
      delta: 0,
      accent: "red" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="currentColor"
            d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2V9h2v5Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-divider pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Dashboard do Gestor
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Visão geral da APS •{" "}
            <span className="font-medium">Microárea: Todas</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RMButton look="soft" tone="neutral" size="md">
            30 dias
            <svg
              viewBox="0 0 24 24"
              className="ml-2 size-4 text-foreground/70"
              aria-hidden
            >
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </RMButton>

          <RMButton
            look="soft"
            tone="neutral"
            aria-label="Exportar"
            className="p-2 px-2"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path
                fill="currentColor"
                d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4V7h3l-5-5z"
              />
            </svg>
          </RMButton>
        </div>
      </div>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            delta={k.delta}
            accent={k.accent}
            icon={k.icon}
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
              <RMButton look="soft" tone="neutral" size="sm">
                Todas as Microáreas ▾
              </RMButton>
              <RMButton look="soft" tone="neutral" size="sm">
                HAS ▾
              </RMButton>
              <RMButton look="soft" tone="neutral" size="sm">
                2025 ▾
              </RMButton>
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
                tone: "critical" as const,
              },
              {
                nome: "José A.",
                id: "****1234",
                cond: "HAS",
                quando: "30 min",
                tone: "safe" as const,
              },
              {
                nome: "Ana L.",
                id: "****5678",
                cond: "HAS/DM",
                quando: "2 hr",
                tone: "moderate" as const,
              },
              {
                nome: "Clara M.",
                id: "****4312",
                cond: "HAS",
                quando: "4 hr",
                tone: "safe" as const,
              },
            ].map((a, i) => (
              <li
                key={i}
                className="relative rounded-xl border border-divider bg-content1 p-3 shadow-soft transition hover:bg-content2 focus-within:ring-2 focus-within:ring-focus"
              >
                {/* filete por status */}
                <span
                  className={`absolute inset-y-0 left-0 w-[6px] rounded-l-xl ${
                    a.tone === "critical"
                      ? "bg-risk-critical"
                      : a.tone === "moderate"
                        ? "bg-risk-moderate"
                        : "bg-risk-safe"
                  }`}
                  aria-hidden
                />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {a.nome}{" "}
                      <span className="text-foreground/60">{a.id}</span>
                    </div>
                    <div className="text-[12px] text-foreground/60">
                      Condição: {a.cond} · Atualizado: {a.quando}
                    </div>
                  </div>
                  <Chip
                    tone={
                      a.tone === "critical"
                        ? "critical"
                        : a.tone === "moderate"
                          ? "moderate"
                          : "safe"
                    }
                  >
                    {a.tone === "critical"
                      ? "Crítico"
                      : a.tone === "moderate"
                        ? "Atenção"
                        : "Seguro"}
                  </Chip>
                </div>
              </li>
            ))}
          </ul>
        </AccentSection>
      </section>

      {/* Pendências */}
      <AccentSection title="Pendências" accent="amber" className="mt-6">
        <div className="overflow-x-auto">
          <table className="table-basic table-zebra w-full">
            <thead className="text-left">
              <tr>
                {["Paciente", "Pendências", "Dias", "Microárea", "Status"].map(
                  (h) => (
                    <th key={h} className="px-6 py-3 font-semibold">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  p: "Fernanda",
                  pen: "Medição PA",
                  d: 64,
                  micro: "Jardim Magnólia",
                  tone: "safe" as const,
                },
                {
                  p: "Fernanda",
                  pen: "Enfermeira",
                  d: 55,
                  micro: "Jardim Magnólia",
                  tone: "safe" as const,
                },
                {
                  p: "Fernanda",
                  pen: "Enfermeira",
                  d: 43,
                  micro: "Jardim Magnólia",
                  tone: "moderate" as const,
                },
                {
                  p: "Fernanda",
                  pen: "Enfermeira",
                  d: 42,
                  micro: "Jardim Magnólia",
                  tone: "critical" as const,
                },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{r.p}</td>
                  <td className="px-6 py-4">{r.pen}</td>
                  <td className="px-6 py-4">{r.d}</td>
                  <td className="px-6 py-4">{r.micro}</td>
                  <td className="px-6 py-4">
                    <Chip
                      tone={
                        r.tone === "critical"
                          ? "critical"
                          : r.tone === "moderate"
                            ? "moderate"
                            : "safe"
                      }
                    >
                      {r.tone === "critical"
                        ? "Crítico"
                        : r.tone === "moderate"
                          ? "Atenção"
                          : "Seguro"}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* paginação */}
        <div className="paginate p-4">
          <button className="paginate-btn" aria-label="Anterior">
            &lt;
          </button>
          {[1, 2, 3, 4, 5, 6].map((p) => (
            <button
              key={p}
              className="paginate-btn"
              data-active={p === 1}
              aria-current={p === 1 ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          <button className="paginate-btn" aria-label="Próxima">
            &gt;
          </button>
        </div>
      </AccentSection>

      {/* Profissionais */}
      <AccentSection title="Profissionais" accent="green" className="mt-6">
        <div className="overflow-x-auto">
          <table className="table-basic table-zebra w-full">
            <thead className="text-left">
              <tr>
                {[
                  "Profissional",
                  "Cargo",
                  "Atend. hoje",
                  "Status",
                  "Ações",
                ].map((h) => (
                  <th key={h} className="px-6 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  n: "Fernanda",
                  cargo: "Enfermeira",
                  local: "USF Maria Madalena",
                  status: "Ativo",
                },
                {
                  n: "Fernanda",
                  cargo: "Enfermeira",
                  local: "USF Maria Madalena",
                  status: "Ativo",
                },
                {
                  n: "Fernanda",
                  cargo: "Enfermeira",
                  local: "USF Maria Madalena",
                  status: "Licença",
                },
                {
                  n: "Fernanda",
                  cargo: "Enfermeira",
                  local: "USF Maria Madalena",
                  status: "Afastado",
                },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{r.n}</td>
                  <td className="px-6 py-4">{r.cargo}</td>
                  <td className="px-6 py-4">{r.local}</td>
                  <td className="px-6 py-4">
                    {r.status === "Ativo" && <Chip tone="safe">Ativo</Chip>}
                    {r.status === "Licença" && <Chip tone="info">Licença</Chip>}
                    {r.status === "Afastado" && (
                      <Chip tone="critical">Afastado</Chip>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <RMButton look="outline" tone="danger" size="sm">
                        Agenda
                      </RMButton>
                      <RMButton look="outline" tone="neutral" size="sm">
                        Gerenciar
                      </RMButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* paginação */}
        <div className="paginate p-4">
          <button className="paginate-btn" aria-label="Anterior">
            &lt;
          </button>
          {[1, 2, 3, 4, 5, 6].map((p) => (
            <button
              key={p}
              className="paginate-btn"
              data-active={p === 1}
              aria-current={p === 1 ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          <button className="paginate-btn" aria-label="Próxima">
            &gt;
          </button>
        </div>
      </AccentSection>
    </>
  );
}
