// frontend/components/ui/AccentSection.tsx
"use client";

import { cn } from "@/lib/utils";
import { Card } from "@heroui/react";
import { tv, type VariantProps } from "tailwind-variants";

const section = tv({
  slots: {
    root: [
      "relative overflow-hidden rounded-2xl",
      "bg-content1 text-foreground border border-divider shadow-soft",
      // faixa colorida à esquerda
      "before:content-[''] before:absolute before:inset-y-0 before:left-0",
      "before:rounded-l-2xl",
    ].join(" "),
    header: "flex items-center justify-between gap-3 pb-4",
    title: "font-semibold tracking-tight",
    right: "flex flex-wrap items-center gap-2",
    content: "space-y-4",
  },
  variants: {
    accent: {
      brand: "before:bg-orange-500 dark:before:bg-orange-400",
      green: "before:bg-emerald-500 dark:before:bg-emerald-400",
      blue: "before:bg-sky-500 dark:before:bg-sky-400",
      red: "before:bg-rose-500 dark:before:bg-rose-400",
      amber: "before:bg-amber-500 dark:before:bg-amber-400",
      slate: "before:bg-slate-300 dark:before:bg-slate-600",
    },
    /** Tamanho controla padding, altura “ótima” do header e largura da faixa */
    size: {
      xs: {
        root: "p-3 before:w-[4px]",
        header: "pb-3",
        title: "text-[1rem]",
        content: "space-y-3",
      },
      sm: {
        root: "p-4 before:w-[5px]",
        header: "pb-3.5",
        title: "text-[1.0625rem]",
        content: "space-y-4",
      },
      md: {
        root: "p-5 before:w-[6px]",
        header: "pb-4",
        title: "text-[1.125rem]",
        content: "space-y-4",
      },
      lg: {
        root: "p-6 before:w-2",
        header: "pb-5",
        title: "text-[1.25rem]",
        content: "space-y-5",
      },
    },
    /** Densidade extra para quem quer só mexer no vertical do header */
    density: {
      compact: { header: "pb-2" },
      cozy: { header: "pb-3.5" },
      comfortable: { header: "pb-5" },
    },
    /** Alternativa com fundo levemente mais contrastado */
    tone: {
      plain: { root: "bg-content1" },
      soft: { root: "bg-content2" },
    },
  },
  defaultVariants: {
    accent: "brand",
    size: "md",
    tone: "plain",
  },
});

export type AccentSectionProps = VariantProps<typeof section> & {
  /** Título aceita string/ícones/qualquer ReactNode */
  title?: React.ReactNode;
  /** Conteúdo que fica no canto direito do cabeçalho (filtros, botões) */
  right?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  /** Permite sobrescrever a cor/largura da faixa via CSS vars, se preciso */
  style?: React.CSSProperties & {
    ["--accent"]?: string;
    ["--accent-w"]?: string;
  };
};

export function AccentSection({
  title,
  right,
  children,
  className,
  contentClassName,
  accent,
  size,
  density,
  tone,
  ...rest
}: AccentSectionProps) {
  const {
    root,
    header,
    title: titleCls,
    right: rightCls,
    content,
  } = section({
    accent,
    size,
    density,
    tone,
  });

  return (
    <Card
      shadow="none"
      className={cn(
        root(),
        // suporte a CSS vars opcionais
        "[--accent:theme(colors.orange.500)] dark:[--accent:theme(colors.orange.400)]",
        "before:bg-[var(--accent)]",
        // se quiser mudar a largura via style="--accent-w:8px"
        "before:w-[var(--accent-w,theme(spacing.1.5))]",
        className
      )}
      {...rest}
    >
      {(title || right) && (
        <div className={header()}>
          {title ? <h2 className={titleCls()}>{title}</h2> : <div />}
          {right ? <div className={rightCls()}>{right}</div> : null}
        </div>
      )}
      <div className={cn(content(), contentClassName)}>{children}</div>
    </Card>
  );
}
