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
  /** Se deve inverter para superfícies escuras */
  inverted?: boolean;
}

/**
 * Ícone SVG proprietário do RastreiaCardio:
 * Combina o contorno acolhedor do Coração (Cuidado Cardiovascular)
 * com a onda ativa do Eletrocardiograma (Rastreamento Contínuo e Monitoramento de Risco).
 */
export function BrandIconMark({
  size = 36,
  className = "",
  hasBackground = true,
}: {
  size?: number;
  className?: string;
  hasBackground?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center select-none overflow-hidden transition-transform duration-200",
        hasBackground &&
          "rounded-xl bg-gradient-to-br from-primary via-primary-600 to-orange-600 text-white shadow-md shadow-primary/25 ring-1 ring-white/20",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full p-[14%]"
        fill="none"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="rc-brand-gradient"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Silhueta Translúcida do Coração no Fundo */}
        <path
          d="M16 26.5C16 26.5 6 20 6 12.5C6 9 8.8 6.5 12 6.5C13.8 6.5 15.1 7.3 16 8.3C16.9 7.3 18.2 6.5 20 6.5C23.2 6.5 26 9 26 12.5C26 20 16 26.5 16 26.5Z"
          fill={hasBackground ? "white" : "url(#rc-brand-gradient)"}
          fillOpacity={hasBackground ? 0.22 : 0.15}
        />

        {/* Onda de Ritmo Cardíaco / Eletrocardiograma (Rastreia) */}
        <path
          d="M5 15H10.5L12.5 11L15.5 20L18.5 7.5L21 17.5L22.5 15H27"
          stroke={hasBackground ? "white" : "currentColor"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
        />

        {/* Ponto Vital / Trajetória Ativa */}
        <circle
          cx="27"
          cy="15"
          fill={hasBackground ? "white" : "currentColor"}
          r="1.25"
        />
      </svg>
    </div>
  );
}

/**
 * Componente oficial e padronizado do Logotipo RastreiaCardio para toda a aplicação.
 */
export function BrandLogo({
  variant = "horizontal",
  size = "md",
  href,
  subtitle = true,
  className = "",
  inverted = false,
}: BrandLogoProps) {
  // Configurações de dimensão por tamanho
  const sizeMap = {
    xs: { iconSize: 22, text: "text-sm", sub: "text-[9px]" },
    sm: { iconSize: 28, text: "text-base", sub: "text-[10px]" },
    md: { iconSize: 36, text: "text-lg", sub: "text-[10px]" },
    lg: { iconSize: 44, text: "text-2xl", sub: "text-xs" },
    xl: { iconSize: 56, text: "text-3xl md:text-4xl", sub: "text-xs" },
  };

  const { iconSize, text: textSizeClass, sub: subSizeClass } = sizeMap[size];

  // Determina o texto de subtítulo padrão
  const defaultSubtitleText =
    typeof subtitle === "string" ? subtitle : "APS Digital";
  const showSubtitle =
    variant === "full" && subtitle !== false && subtitle !== undefined;

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-95 select-none",
        className,
      )}
    >
      <BrandIconMark size={iconSize} />

      {variant !== "icon" && (
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-extrabold tracking-tight font-heading",
                textSizeClass,
                inverted
                  ? "text-white"
                  : "text-slate-900 dark:text-white",
              )}
            >
              Rastreia
              <span className="text-primary font-black ml-0.5">Cardio</span>
            </span>

            {/* Badge Pill discreta em variante horizontal se desejado */}
            {variant === "horizontal" && subtitle === true && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider ml-1">
                APS
              </span>
            )}
          </div>

          {showSubtitle && (
            <span
              className={cn(
                "font-semibold uppercase tracking-wider",
                subSizeClass,
                inverted
                  ? "text-slate-400"
                  : "text-slate-500 dark:text-zinc-400",
              )}
            >
              {defaultSubtitleText}
            </span>
          )}
        </div>
      )}
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
