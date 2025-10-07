"use client";

import { AccentSection } from "@/components/ui/AccentSection";
import { StatusChip } from "@/components/ui/StatusChip";
import { cn } from "@/lib/utils";

export type KpiAccent = "brand" | "blue" | "amber" | "green" | "red";

export type KpiCardProps = {
  label: string;
  value: number | string;
  /** variação em relação ao período anterior (ex.: +2, -1) */
  delta?: number;
  icon?: React.ReactNode;
  accent?: KpiAccent;
  className?: string;
};

const STRIPE_COLOR_BY_ACCENT: Record<KpiAccent, string> = {
  brand: "before:bg-[var(--brand)]",
  blue: "before:bg-sky-500 dark:before:bg-sky-400",
  amber: "before:bg-amber-500 dark:before:bg-amber-400",
  green: "before:bg-emerald-500 dark:before:bg-emerald-400",
  red: "before:bg-rose-500 dark:before:bg-rose-400",
};

export function KpiCard({
  label,
  value,
  delta,
  icon,
  accent = "brand",
  className,
}: KpiCardProps) {
  const showDelta = typeof delta === "number" && delta !== 0;
  const deltaTone: "safe" | "critical" | undefined = showDelta
    ? delta! > 0
      ? "safe"
      : "critical"
    : undefined;

  return (
    <AccentSection
      // usamos o AccentSection só como “card” e ajustamos a faixa via classes abaixo
      size="md"
      tone="plain"
      className={cn(
        "relative min-h-[132px] p-5",
        // garante que a faixa apareça e tenha largura/posição corretas
        "before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-[6px] before:rounded-l-2xl",
        STRIPE_COLOR_BY_ACCENT[accent],
        className
      )}
      // sem cabeçalho nativo; conteúdo direto
      title={undefined}
      contentClassName="space-y-0"
    >
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
        {showDelta && (
          <StatusChip size="sm" tone={deltaTone}>
            {delta! > 0 ? `+${delta}` : delta}
          </StatusChip>
        )}
      </div>

      <p className="mt-2 text-[12px] text-foreground/60">
        Aumento/diminuição em relação ao mês anterior
      </p>
    </AccentSection>
  );
}
