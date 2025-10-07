"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const section = tv({
  slots: {
    root: [
      "relative overflow-hidden rounded-2xl",
      "bg-content1 text-foreground border border-divider shadow-soft",
      // faixa colorida à esquerda (controlada por --accent / --accent-w)
      "before:content-[''] before:absolute before:inset-y-0 before:left-0",
      "before:rounded-l-2xl",
      "before:bg-[var(--accent)] before:w-[var(--accent-w,6px)]",
      // UX
      "flex flex-col focus-within:outline focus-within:outline-2 focus-within:outline-[var(--focus)] focus-within:outline-offset-2",
    ].join(" "),
    header: "flex items-center justify-between gap-3 pb-4",
    title: "font-semibold tracking-tight",
    right: "flex flex-wrap items-center gap-2",
    content: "space-y-4",
    description: "text-sm text-foreground/60",
  },
  variants: {
    // Define APENAS a CSS var; evita conflito de classes utilitárias
    accent: {
      brand: "[--accent:var(--brand)]",
      green:
        "[--accent:theme(colors.emerald.500)] dark:[--accent:theme(colors.emerald.400)]",
      blue: "[--accent:theme(colors.sky.500)] dark:[--accent:theme(colors.sky.400)]",
      red: "[--accent:theme(colors.rose.500)] dark:[--accent:theme(colors.rose.400)]",
      amber:
        "[--accent:theme(colors.amber.500)] dark:[--accent:theme(colors.amber.400)]",
      slate:
        "[--accent:theme(colors.slate.300)] dark:[--accent:theme(colors.slate.600)]",
      // para usar cor livre: <AccentSection accent="custom" style={{ "--accent": "#..."}}
      custom: "",
    },
    size: {
      xs: {
        root: "p-3",
        header: "pb-3",
        title: "text-[1rem]",
        content: "space-y-3",
      },
      sm: {
        root: "p-4",
        header: "pb-3.5",
        title: "text-[1.0625rem]",
        content: "space-y-4",
      },
      md: {
        root: "p-5",
        header: "pb-4",
        title: "text-[1.125rem]",
        content: "space-y-4",
      },
      lg: {
        root: "p-6",
        header: "pb-5",
        title: "text-[1.25rem]",
        content: "space-y-5",
      },
    },
    density: {
      compact: { header: "pb-2" },
      cozy: { header: "pb-3.5" },
      comfortable: { header: "pb-5" },
    },
    tone: {
      plain: { root: "bg-content1" },
      soft: { root: "bg-content2" },
      elevated: { root: "bg-content1 shadow-soft" },
    },
    divider: {
      true: { header: "border-b border-divider" },
    },
  },
  defaultVariants: { accent: "brand", size: "md", tone: "plain" },
});

export type AccentSectionProps = VariantProps<typeof section> & {
  title?: React.ReactNode;
  /** Subtítulo/descrição pequena sob o título */
  description?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Override por slot (root, header, title, right, content, description) */
  classNames?: Partial<
    Record<
      "root" | "header" | "title" | "right" | "content" | "description",
      string
    >
  >;
  children: React.ReactNode;

  /** Semântica */
  as?: keyof JSX.IntrinsicElements; // container tag
  titleAs?: keyof JSX.IntrinsicElements; // heading tag para o título

  style?: React.CSSProperties & {
    ["--accent"]?: string;
    ["--accent-w"]?: string;
  };

  /** Atributos nativos */
  id?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "title">;

export function AccentSection({
  title,
  description,
  right,
  children,
  className,
  classNames,
  contentClassName,
  accent,
  size,
  density,
  tone,
  divider,
  as = "section",
  titleAs = "h2",
  style,
  id,
  ...domProps
}: AccentSectionProps) {
  const Comp = as as any;
  const TitleTag = titleAs as any;

  const {
    root,
    header,
    title: titleCls,
    right: rightCls,
    content,
    description: descriptionCls,
  } = section({ accent, size, density, tone, divider });

  // acessibilidade: associa o título ao "region"
  const reactId = React.useId();
  const titleId = title ? `${id ?? reactId}-title` : undefined;

  return (
    <Comp
      id={id}
      role={title ? "region" : undefined}
      aria-labelledby={title ? titleId : undefined}
      style={style}
      data-accent={accent}
      className={cn(root(), className, classNames?.root)}
      {...domProps}
    >
      {(title || right || description) && (
        <div className={cn(header(), classNames?.header)}>
          <div className="min-w-0">
            {title ? (
              <TitleTag
                id={titleId}
                className={cn(titleCls(), classNames?.title)}
              >
                {title}
              </TitleTag>
            ) : null}
            {description ? (
              <div className={cn(descriptionCls(), classNames?.description)}>
                {description}
              </div>
            ) : null}
          </div>

          {right ? (
            <div className={cn(rightCls(), classNames?.right)}>{right}</div>
          ) : null}
        </div>
      )}

      <div className={cn(content(), contentClassName, classNames?.content)}>
        {children}
      </div>
    </Comp>
  );
}
