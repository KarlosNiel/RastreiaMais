// frontend/components/ui/BrandLogo.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  /** Variante de exibição do logo */
  variant?: "full" | "horizontal" | "icon" | "mark-only" | "image";
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
  /** Se deve forçar uso da imagem raster oficial em vez do lockup vetorial */
  useOfficialImage?: boolean;
}

/**
 * Ícone e Símbolo Oficial do RastreiaCardio:
 * Coração estilizado em fita gradiente laranja (Cuidado Cardiovascular),
 * linha ativa de Eletrocardiograma (Rastreamento Contínuo de Risco)
 * e malha geométrica de nós interconectados (Saúde Digital e APS Multidisciplinar).
 * 
 * Sem caixas pesadas artificiais: o símbolo respira limpo e direto.
 */
export function BrandIconMark({
  size = 36,
  className = "",
  hasBackground = false,
  priority = false,
}: {
  size?: number;
  className?: string;
  hasBackground?: boolean;
  priority?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  // Proporção original do símbolo do RastreiaCardio: 909 x 794 (1.145 : 1)
  const markHeight = Math.round(size * (794 / 909));

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center select-none transition-transform duration-200",
        hasBackground &&
          "p-1.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 dark:border-orange-500/30",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <Image
          alt="Símbolo RastreiaCardio"
          className="w-full h-full object-contain pointer-events-none drop-shadow-sm select-none"
          height={markHeight}
          priority={priority}
          quality={95}
          src="/brand-mark.webp"
          width={size}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback vetorial SVG de alta precisão */
        <svg
          className="w-full h-full object-contain pointer-events-none"
          fill="none"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="rc-vector-grad"
              x1="2"
              y1="4"
              x2="30"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>

          {/* Lado Esquerdo do Coração (Faixa) */}
          <path
            d="M15.5 8.2C13.8 6.2 10.8 5 8 5C4.2 5 2 7.8 2 12C2 17.5 7.5 22.8 15.5 28C15.8 28.2 16.2 28.2 16.5 28C14.5 25.5 11 21.8 10 18.5C9.2 15.8 9.5 13.5 10.8 11.5C11.8 9.8 13.5 8.8 15.5 8.2Z"
            fill="url(#rc-vector-grad)"
          />

          {/* Malha Digital (Lado Direito) */}
          <g stroke="url(#rc-vector-grad)" strokeWidth="0.8" opacity="0.85">
            <line x1="25.5" y1="6.5" x2="20.5" y2="10.5" />
            <line x1="25.5" y1="6.5" x2="28.5" y2="14" />
            <line x1="20.5" y1="10.5" x2="28.5" y2="14" />
            <line x1="20.5" y1="10.5" x2="24" y2="19.5" />
            <line x1="28.5" y1="14" x2="24" y2="19.5" />
            <line x1="24" y1="19.5" x2="19" y2="24" />
          </g>

          <circle cx="25.5" cy="6.5" r="1.6" fill="url(#rc-vector-grad)" />
          <circle cx="20.5" cy="10.5" r="1.3" fill="url(#rc-vector-grad)" />
          <circle cx="28.5" cy="14" r="1.4" fill="url(#rc-vector-grad)" />
          <circle cx="24" cy="19.5" r="1.3" fill="url(#rc-vector-grad)" />
          <circle cx="19" cy="24" r="1.2" fill="url(#rc-vector-grad)" />

          {/* Onda ECG */}
          <path
            d="M1 18H8.5L10 16.5L12 21L14.5 9L17.5 23L19.5 16L21 18H25"
            stroke="url(#rc-vector-grad)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </div>
  );
}

/**
 * Componente oficial e padronizado do Logotipo RastreiaCardio para toda a aplicação.
 * Fiel à identidade visual original, limpo, direto e profissional.
 */
export function BrandLogo({
  variant = "horizontal",
  size = "md",
  href,
  subtitle = true,
  className = "",
  inverted = false,
  useOfficialImage = false,
}: BrandLogoProps) {
  // Configurações de dimensão por tamanho
  const sizeMap = {
    xs: {
      iconSize: 24,
      imageHeight: 22,
      text: "text-sm",
      sub: "text-[9px]",
    },
    sm: {
      iconSize: 30,
      imageHeight: 26,
      text: "text-base",
      sub: "text-[10px]",
    },
    md: {
      iconSize: 38,
      imageHeight: 32,
      text: "text-lg",
      sub: "text-[11px]",
    },
    lg: {
      iconSize: 48,
      imageHeight: 40,
      text: "text-2xl",
      sub: "text-xs",
    },
    xl: {
      iconSize: 62,
      imageHeight: 52,
      text: "text-3xl md:text-4xl",
      sub: "text-xs",
    },
  };

  const { iconSize, imageHeight, text: textSizeClass, sub: subSizeClass } =
    sizeMap[size];

  // Determina o texto de subtítulo padrão
  const defaultSubtitleText =
    typeof subtitle === "string" ? subtitle : "Atenção Primária à Saúde";
  const showSubtitle =
    variant === "full" && subtitle !== false && subtitle !== undefined;

  // Renderização direta da imagem oficial completa se solicitada
  if (variant === "image" || useOfficialImage) {
    const imageSrc = inverted
      ? "/RastreiaCardio-dark.png"
      : "/RastreiaCardio.png";

    const imageElement = (
      <div
        className={cn(
          "inline-flex items-center transition-opacity hover:opacity-95 select-none",
          className,
        )}
      >
        <Image
          alt="RastreiaCardio - Atenção Primária à Saúde"
          className="w-auto object-contain"
          height={imageHeight}
          priority
          src={imageSrc}
          width={Math.round(imageHeight * (3030 / 952))}
        />
      </div>
    );

    if (href) {
      return (
        <Link
          aria-label="RastreiaCardio - Início"
          className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          href={href}
        >
          {imageElement}
        </Link>
      );
    }
    return imageElement;
  }

  // Renderização apenas do ícone
  if (variant === "icon" || variant === "mark-only") {
    const iconElement = (
      <div
        className={cn(
          "inline-flex items-center justify-center transition-transform hover:scale-105 select-none",
          className,
        )}
      >
        <BrandIconMark size={iconSize} />
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
  // RASTREIA em Laranja Vibrante Oficial + CARDIO em Carvão/Branco + Símbolo do Coração
  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-95 select-none",
        className,
      )}
    >
      <BrandIconMark size={iconSize} />

      <div className="flex flex-col min-w-0 leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-black tracking-tight font-heading uppercase",
              textSizeClass,
              "text-primary",
            )}
          >
            Rastreia
            <span
              className={cn(
                "ml-1 font-extrabold",
                inverted
                  ? "text-white"
                  : "text-slate-800 dark:text-zinc-100",
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
              inverted
                ? "text-slate-400"
                : "text-slate-500 dark:text-zinc-400",
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
