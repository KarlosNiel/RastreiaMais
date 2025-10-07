// frontend/components/ui/StatusChip.tsx
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const chip = tv({
  base: [
    "inline-flex items-center gap-1 rounded-full border",
    "font-medium leading-none whitespace-nowrap select-none",
  ].join(" "),
  variants: {
    tone: {
      // riscos (Figma)
      safe:
        "text-emerald-700 border-emerald-300 bg-emerald-50 " +
        "dark:text-emerald-300 dark:border-emerald-700 dark:bg-emerald-900/20",
      attention:
        "text-amber-700 border-amber-300 bg-amber-50 " +
        "dark:text-amber-300 dark:border-amber-700 dark:bg-amber-900/20",
      critical:
        "text-rose-700 border-rose-300 bg-rose-50 " +
        "dark:text-rose-300 dark:border-rose-600 dark:bg-rose-900/20",

      // neutros/auxiliares
      neutral: "text-foreground border-foreground/20 bg-content2",
      info: "text-foreground border-foreground/25 bg-foreground/[6%]",
      brand:
        "text-[var(--brand)] " +
        "border-[color-mix(in_oklab,var(--brand)_30%,transparent)] " +
        "bg-[color-mix(in_oklab,var(--brand)_10%,transparent)]",

      // **novos/retornando** para status do profissional
      active:
        "text-emerald-700 border-emerald-300 bg-emerald-50 " +
        "dark:text-emerald-300 dark:border-emerald-700 dark:bg-emerald-900/20",
      license:
        "text-sky-700 border-sky-300 bg-sky-50 " +
        "dark:text-sky-300 dark:border-sky-700 dark:bg-sky-900/20",
      away:
        "text-rose-700 border-rose-300 bg-rose-50 " +
        "dark:text-rose-300 dark:border-rose-600 dark:bg-rose-900/20",
    },
    size: {
      sm: "h-7 px-2.5 text-[12px]",
      md: "h-8 px-3 text-[13px]",
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
      data-tone={tone}
      className={cn(chip({ tone, size }), className)}
    >
      {children}
    </span>
  );
}
