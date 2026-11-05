"use client";

import React from "react";

import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: number | string;
  delta?: number;
  icon?: React.ReactNode;
  accent?: "brand" | "amber" | "blue" | "red" | "green";
  className?: string;
  footerText?: string;
}

const ACCENT_STYLES: Record<string, string> = {
  brand:
    "bg-orange-50/90 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  amber:
    "bg-amber-50/90 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  blue: "bg-sky-50/90 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  red: "bg-rose-50/90 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  green:
    "bg-emerald-50/90 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export function KpiCard({
  label,
  value,
  delta,
  icon,
  className,
  accent = "brand",
  footerText,
}: KpiCardProps) {
  const showDelta = typeof delta === "number" && delta !== 0;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
              ACCENT_STYLES[accent] ||
                "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </span>
        {showDelta && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
              delta! > 0
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
            )}
          >
            {delta! > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>

      {footerText && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] font-medium text-slate-400 dark:text-zinc-500 truncate">
          {footerText}
        </div>
      )}
    </div>
  );
}
