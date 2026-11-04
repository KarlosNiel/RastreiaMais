// frontend/components/ui/StatusChip.tsx
import { ComponentPropsWithoutRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";

const chip = tv({
  base: [
    "inline-flex items-center gap-1.5 rounded-md border",
    "font-medium leading-none whitespace-nowrap select-none tracking-tight",
  ].join(" "),
  variants: {
    tone: {
      // riscos
      safe:
        "text-emerald-700 border-emerald-200/80 bg-emerald-50/80 " +
        "dark:text-emerald-400 dark:border-emerald-800/60 dark:bg-emerald-950/30",
      attention:
        "text-amber-700 border-amber-200/80 bg-amber-50/80 " +
        "dark:text-amber-400 dark:border-amber-800/60 dark:bg-amber-950/30",
      critical:
        "text-rose-700 border-rose-200/80 bg-rose-50/80 " +
        "dark:text-rose-400 dark:border-rose-800/60 dark:bg-rose-950/30",

      // neutros/auxiliares
      neutral:
        "text-slate-700 border-slate-200/80 bg-slate-50 " +
        "dark:text-zinc-300 dark:border-zinc-700/80 dark:bg-zinc-800/40",
      info:
        "text-sky-700 border-sky-200/80 bg-sky-50/80 " +
        "dark:text-sky-400 dark:border-sky-800/60 dark:bg-sky-950/30",
      brand:
        "text-orange-700 border-orange-200/80 bg-orange-50/80 " +
        "dark:text-orange-400 dark:border-orange-800/60 dark:bg-orange-950/30",

      // status do profissional
      active:
        "text-emerald-700 border-emerald-200/80 bg-emerald-50/80 " +
        "dark:text-emerald-400 dark:border-emerald-800/60 dark:bg-emerald-950/30",
      license:
        "text-sky-700 border-sky-200/80 bg-sky-50/80 " +
        "dark:text-sky-400 dark:border-sky-800/60 dark:bg-sky-950/30",
      away:
        "text-rose-700 border-rose-200/80 bg-rose-50/80 " +
        "dark:text-rose-400 dark:border-rose-800/60 dark:bg-rose-950/30",
    },
    size: {
      sm: "h-6 px-2 text-[11px]",
      md: "h-7 px-2.5 text-[12px]",
    },
  },
  defaultVariants: {
    tone: "neutral",
    size: "md",
  },
});

export type StatusChipProps = VariantProps<typeof chip> &
  ComponentPropsWithoutRef<"span">;

export function StatusChip({
  tone,
  size,
  className,
  children,
  ...rest
}: StatusChipProps) {
  return (
    <span
      {...rest}
      className={cn(chip({ tone, size }), className)}
      data-tone={tone}
    >
      {children}
    </span>
  );
}
