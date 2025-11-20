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
  accent?: "brand" | "amber" | "blue" | "red" | "green";
  className?: string;
  footerText?: string; 
}

export function KpiCard({
  label,
  value,
  delta,
  icon,
  className,
  footerText = "Dados relacionados à sua última checagem.", 
}: KpiCardProps) {
  const showDelta = typeof delta === "number" && delta !== 0;
  const deltaTone: "safe" | "critical" | undefined =
    showDelta && delta! > 0 ? "safe" : showDelta ? "critical" : undefined;

  return (
    <Card
      shadow="sm"
      className={cn(
        "min-h-[132px] p-5 rounded-md transition-all hover:shadow-md border border-transparent",
        "bg-white text-gray-800 hover:border-gray-200",
        "dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-800",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-md text-gray-500 dark:text-gray-400">{label}</div>
        {icon && (
          <div className="grid size-8 place-items-center rounded-xl bg-white border-1 dark:bg-gray-900 border-orange-600 text-gray-600 dark:text-gray-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="text-2xl font-semibold">{value}</div>
      </div>

      <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">
        {footerText} 
      </p>
    </Card>
  );
}
