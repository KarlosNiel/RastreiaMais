// frontend/components/home/LandingLogo.tsx
import Link from "next/link";
import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

interface LandingLogoProps {
  href?: string | null;
  showBadge?: boolean;
  className?: string;
  /** Versão para fundos escuros */
  inverted?: boolean;
}

/** Logo da landing: círculo laranja com pulso + "RastreiaCardio" + badge APS */
export function LandingLogo({
  href = "/",
  showBadge = true,
  className,
  inverted = false,
}: LandingLogoProps) {
  const content = (
    <span
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-sm shadow-brand/30">
        <Activity className="size-4" strokeWidth={2.5} />
      </span>
      <span
        className={cn(
          "font-display text-[17px] font-bold tracking-tight",
          inverted ? "text-white" : "text-slate-900 dark:text-zinc-100",
        )}
      >
        Rastreia<span className="text-brand">Cardio</span>
      </span>
      {showBadge && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            inverted
              ? "bg-white/10 text-slate-200"
              : "bg-brand/10 text-brand dark:bg-brand/20",
          )}
        >
          APS
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link
      aria-label="RastreiaCardio - Início"
      className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      href={href}
    >
      {content}
    </Link>
  );
}
