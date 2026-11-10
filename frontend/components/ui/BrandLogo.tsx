// frontend/components/ui/BrandLogo.tsx
"use client";

import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  /** Variante de exibição do logo */
  variant?: "full" | "horizontal" | "icon" | "mark-only";
  /** Escala de tamanho */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Se deve ser clicável como Link para a Home ou Dashboard */
  href?: string | null;
  /** Subtítulo descritivo customizado (ou false para ocultar) */
  subtitle?: string | boolean;
  /** Classes adicionais para o contêiner raiz */
  className?: string;
  /** Se deve inverter tipografia para superfícies escuras */
  inverted?: boolean;
  /** Se deve exibir o micro-badge suave ao redor do ícone */
  badge?: boolean;
}

/**
 * Símbolo Oficial Moderno do RastreiaCardio:
 * Design limpo, minimalista e de alta precisão vetorial (estilo Linear / Apple Health).
 * Combina o contorno geométrico do Coração (cuidado e vida)
 * com o pulso ativo de Eletrocardiograma (rastreamento contínuo e monitoramento na APS).
 *
 * Sem ruído, sem teias de aranha e sem poluição visual: 100% legível em 24px, 32px ou 48px.
 */
export function BrandIconMark({
  size = 32,
  className = "",
  hasBackground = false,
  inverted = false,
}: {
  size?: number;
  className?: string;
  hasBackground?: boolean;
  inverted?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center select-none transition-transform duration-200",
        hasBackground &&
          "rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 dark:border-orange-500/30 p-1.5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full object-contain pointer-events-none"
        fill="none"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="rc-clean-orange"
            x1="2"
            x2="30"
            y1="4"
            y2="30"
          >
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Preenchimento sutil e translúcido para dar volume sem poluir */}
        <path
          d="M16 26.5C16 26.5 5 19 5 11.5C5 7.2 8.2 4 12.2 4C14.5 4 15.4 5 16 6.2C16.6 5 17.5 4 19.8 4C23.8 4 27 7.2 27 11.5C27 19 16 26.5 16 26.5Z"
          fill="url(#rc-clean-orange)"
          fillOpacity={inverted ? 0.16 : 0.08}
        />

        {/* Contorno Geométrico Limpo do Coração */}
        <path
          d="M16 26.5C16 26.5 5 19 5 11.5C5 7.2 8.2 4 12.2 4C14.5 4 15.4 5 16 6.2C16.6 5 17.5 4 19.8 4C23.8 4 27 7.2 27 11.5C27 19 16 26.5 16 26.5Z"
          stroke="url(#rc-clean-orange)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />

        {/* Onda de Ritmo Cardíaco / Eletrocardiograma (Rastreia) */}
        <path
          d="M3 15H9.5L11.5 10.5L14.5 20.5L17.5 7.5L20.5 17.5L22 15H29"
          stroke={inverted ? "#FFFFFF" : "#EA580C"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
        />
      </svg>
    </div>
  );
}

/**
 * Componente oficial e padronizado do Logotipo RastreiaCardio para toda a aplicação.
 * Fiel aos princípios do Refactoring UI e Taste Skill: limpo, moderno, legível e direto.
 */
export function BrandLogo({
  variant = "horizontal",
  size = "md",
  href,
  subtitle = true,
  className = "",
  inverted = false,
  badge = false,
}: BrandLogoProps) {
  // Configurações de dimensão por tamanho
  const sizeMap = {
    xs: {
      iconSize: 22,
      text: "text-sm",
      sub: "text-[9px]",
    },
    sm: {
      iconSize: 28,
      text: "text-base",
      sub: "text-[10px]",
    },
    md: {
      iconSize: 34,
      text: "text-lg",
      sub: "text-[10px]",
    },
    lg: {
      iconSize: 42,
      text: "text-2xl",
      sub: "text-xs",
    },
    xl: {
      iconSize: 52,
      text: "text-3xl md:text-4xl",
      sub: "text-xs",
    },
  };

  const { iconSize, text: textSizeClass, sub: subSizeClass } = sizeMap[size];

  // Determina o texto de subtítulo padrão
  const defaultSubtitleText =
    typeof subtitle === "string" ? subtitle : "Atenção Primária à Saúde";
  const showSubtitle =
    variant === "full" && subtitle !== false && subtitle !== undefined;

  // Renderização apenas do ícone
  if (variant === "icon" || variant === "mark-only") {
    const iconElement = (
      <div
        className={cn(
          "inline-flex items-center justify-center transition-transform hover:scale-105 select-none",
          className,
        )}
      >
        <BrandIconMark
          hasBackground={badge}
          inverted={inverted}
          size={iconSize}
        />
      </div>
    );

    if (href) {
      return (
        <Link
          aria-label="RastreiaCardio"
          className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          href={href}
        >
          {iconElement}
        </Link>
      );
    }

    return iconElement;
  }

  // Renderização responsiva padrão (Horizontal ou Full):
  // Rastreia em Laranja Vibrante + Cardio em Carvão/Branco + Símbolo Limpo
  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-95 select-none",
        className,
      )}
    >
      <BrandIconMark
        hasBackground={badge}
        inverted={inverted}
        size={iconSize}
      />

      <div className="flex flex-col min-w-0 leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-extrabold tracking-tight font-heading",
              textSizeClass,
              "text-primary",
            )}
          >
            Rastreia
            <span
              className={cn(
                "ml-0.5 font-bold",
                inverted ? "text-white" : "text-slate-900 dark:text-zinc-100",
              )}
            >
              Cardio
            </span>
          </span>

          {/* Badge Pill discreta em variante horizontal */}
          {variant === "horizontal" && subtitle === true && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider ml-1">
              APS
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            className={cn(
              "font-medium tracking-wide uppercase",
              subSizeClass,
              inverted ? "text-slate-400" : "text-slate-500 dark:text-zinc-400",
            )}
          >
            {defaultSubtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        aria-label="RastreiaCardio - Início"
        className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        href={href}
      >
        {content}
      </Link>
    );
  }

  return content;
}
