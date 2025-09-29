// frontend/components/ui/RMButton.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@heroui/react";
import { tv, type VariantProps } from "tailwind-variants";

/** Força branco em todos os slots (e anchors internos) do HeroUI */
const SLOT_WHITE =
  "[&_[data-slot=label]]:!text-white " +
  "[&_[data-slot=content]]:!text-white " +
  "[&_[data-slot=start-content]]:!text-white " +
  "[&_[data-slot=end-content]]:!text-white " +
  // se houver <a> dentro do label/content, mantenha branco
  "[&_[data-slot=label]_a]:!text-white " +
  "[&_[data-slot=content]_a]:!text-white " +
  // fallback extra para implementações diferentes
  "[&_span]:!text-white";

const btn = tv({
  base: [
    "h-9 px-3.5 rounded-xl text-sm font-medium",
    "transition-colors data-[hover=true]:shadow-none",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ring-offset-app",
    "data-[disabled=true]:opacity-60",
  ].join(" "),
  variants: {
    look: { solid: "", outline: "border", soft: "", ghost: "" },
    tone: { brand: "", neutral: "", danger: "" },
    size: { sm: "h-8 px-3 text-[13px] rounded-lg", md: "h-9 px-3.5" },
  },
  compoundVariants: [
    // ===== BRAND =====
    {
      look: "solid",
      tone: "brand",
      // bg da marca + root branco + segurança nos slots
      class: `!bg-[var(--brand)] text-white hover:opacity-90 ${SLOT_WHITE}`,
    },
    {
      look: "outline",
      tone: "brand",
      class:
        "text-primary border-primary/40 hover:bg-primary/10 " +
        "dark:border-primary/50 dark:hover:bg-primary/15",
    },
    {
      look: "soft",
      tone: "brand",
      class:
        "text-primary bg-primary/10 hover:bg-primary/15 " +
        "dark:bg-primary/10 dark:hover:bg-primary/20",
    },
    {
      look: "ghost",
      tone: "brand",
      class: "text-primary hover:bg-primary/10 dark:hover:bg-primary/15",
    },

    // ===== NEUTRAL =====
    {
      look: "outline",
      tone: "neutral",
      class: "border-divider text-foreground hover:bg-content2",
    },
    {
      look: "soft",
      tone: "neutral",
      class: "bg-content2 hover:bg-content3 text-foreground",
    },
    {
      look: "ghost",
      tone: "neutral",
      class: "text-foreground hover:bg-content2",
    },

    // ===== DANGER =====
    {
      look: "solid",
      tone: "danger",
      class: `bg-rose-600 hover:bg-rose-700 ${SLOT_WHITE}`,
    },
    {
      look: "outline",
      tone: "danger",
      class:
        "text-rose-600 border-rose-300 hover:bg-rose-50 " +
        "dark:text-rose-300 dark:border-rose-500/60 dark:hover:bg-rose-500/10",
    },
  ],
  defaultVariants: { look: "outline", tone: "neutral", size: "md" },
});

type RMButtonProps = Omit<ButtonProps, "color" | "variant" | "size"> &
  VariantProps<typeof btn>;

export function RMButton({
  look,
  tone,
  size,
  className,
  ...props
}: RMButtonProps) {
  // Para sólido de marca, ainda deixo o HeroUI setar tokens (foreground etc.)
  const colorProp =
    look === "solid" && tone === "brand" ? ("primary" as const) : undefined;

  return (
    <Button
      radius="lg"
      color={colorProp}
      variant={
        look === "solid"
          ? "solid"
          : look === "outline"
            ? "bordered"
            : look === "soft"
              ? "flat"
              : "light" // ghost
      }
      className={cn(btn({ look, tone, size }), className)}
      {...props}
    />
  );
}
