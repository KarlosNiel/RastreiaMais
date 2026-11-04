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
    "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
  blue: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40",
  red: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40",
  green:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
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
        "flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg transition-colors",
              ACCENT_STYLES[accent] ||
                "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
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
        <p className="mt-2 text-xs text-slate-400 dark:text-zinc-500 line-clamp-1">
          {footerText}
        </p>
      )}
    </div>
  );
}
