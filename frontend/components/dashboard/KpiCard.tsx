"use client";

import { Card } from "@heroui/card";
import { cn } from "@/lib/utils";
import { StatusChip } from "@/components/ui/StatusChip";
import React from "react";

export interface KpiCardProps {
  label: string;
  value: number | string;
  delta?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  icon,
  className,
}: KpiCardProps) {
  const showDelta = typeof delta === "number" && delta !== 0;
  const deltaTone: "safe" | "critical" | undefined =
    showDelta && delta! > 0 ? "safe" : showDelta ? "critical" : undefined;

  return (
    <Card
      shadow="sm"
      className={cn(
        // Layout e base
        "min-h-[132px] p-5 rounded-md transition-all hover:shadow-md border border-transparent",

        // Tema claro
        "bg-white text-gray-800 hover:border-gray-200",

        // Tema escuro
        "dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-800",

        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        {icon && (
          <div className="grid size-8 place-items-center rounded-xl bg-gray-100 dark:border-1 dark:bg-gray-800 dark:border-orange-600 text-gray-600 dark:text-gray-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="text-2xl font-semibold">{value}</div>
      </div>

      <p className="mt-2 text-[12px] text-gray-500 dark:text-gray-400">
        Aumento/diminuição em relação ao mês anterior
      </p>
    </Card>
  );
}
