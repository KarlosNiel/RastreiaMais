// frontend/components/ui/StatusChip.tsx
"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const chip = tv({
  base: "inline-flex items-center rounded-full border px-3 h-8 text-sm font-medium",
  variants: {
    tone: {
      safe: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-700 dark:bg-emerald-900/20",
      attention:
        "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-300 dark:border-amber-700 dark:bg-amber-900/20",
      critical:
        "text-rose-700 border-rose-300 bg-rose-50 dark:text-rose-300 dark:border-rose-600 dark:bg-rose-900/20",
      active:
        "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-700 dark:bg-emerald-900/20",
      license:
        "text-sky-700 border-sky-300 bg-sky-50 dark:text-sky-300 dark:border-sky-700 dark:bg-sky-900/20",
      away: "text-rose-700 border-rose-300 bg-rose-50 dark:text-rose-300 dark:border-rose-600 dark:bg-rose-900/20",
    },
    size: {
      sm: "h-7 px-2.5 text-[13px]",
      md: "h-8 px-3",
    },
  },
  defaultVariants: {
    tone: "safe",
    size: "md",
  },
});

export type StatusChipProps = VariantProps<typeof chip> & {
  children: React.ReactNode;
  className?: string;
};

export function StatusChip({
  tone,
  size,
  children,
  className,
}: StatusChipProps) {
  return (
    <span className={cn(chip({ tone, size }), className)}>{children}</span>
  );
}
