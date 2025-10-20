// frontend/components/pacientes/PatientWizard.tsx
"use client";

import { notifyWarn } from "@/components/ui/notify";
import { Button } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import Step1 from "./sections/Step1Sociodemo";
import Step2, { STEP2_FIELDS } from "./sections/Step2Condicoes";
import Step3, { getStep3FieldsDynamic } from "./sections/Step3Clinica";
import Step4 from "./sections/Step4Multiprof";
import Step5 from "./sections/Step5Plano";

type Props = {
  onSubmit: () => void;
  validateOnNext?: boolean;
  stepFields?: string[][];
  freePillNavigation?: boolean;
};

const STEPS_META = [
  { key: "s1", label: "Sociodemo" },
  { key: "s2", label: "Condições" },
  { key: "s3", label: "Clínica" },
  { key: "s4", label: "Multiprof." },
  { key: "s5", label: "Plano" },
] as const;

const DEFAULT_FIELDS: string[][] = [
  ["socio"],
  [], // s2 é validado com STEP2_FIELDS
  [], // s3 é dinâmico conforme HAS/DM
  ["multiprof"], // s4
  ["plano"], // s5
];

export default function PatientWizard({
  onSubmit,
  validateOnNext = true,
  stepFields,
  freePillNavigation = true,
}: Props) {
  const {
    trigger,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext();

  // seleção do Step 2 (usa para habilitar/validar o Step 3)
  const has = watch("condicoes.has");
  const dm = watch("condicoes.dm");
  const step3Enabled = !!has || !!dm;

  const fieldsByStep =
    stepFields?.length === STEPS_META.length ? stepFields : DEFAULT_FIELDS;

  /** devolve os targets de validação por step (s2/s3 dinâmicos) */
  const getTargetsForStep = useCallback(
    (idx: number): string[] => {
      if (idx === 1) return Array.from(STEP2_FIELDS);
      if (idx === 2) {
        if (!step3Enabled) return []; // não valida nada se step3 desabilitado
        return getStep3FieldsDynamic({ has: !!has, dm: !!dm }).map(String);
      }
      return fieldsByStep[idx] ?? [];
    },
    [fieldsByStep, has, dm, step3Enabled]
  );

  const [step, setStep] = useState(0);
  const total = STEPS_META.length;

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const percent = useMemo(
    () => Math.round(((step + 1) / total) * 100),
    [step, total]
  );

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  /** encontra o primeiro path de erro (profundo) para focar */
  const findFirstErrorPath = useCallback(
    (obj: any, prefix = ""): string | null => {
      for (const k of Object.keys(obj ?? {})) {
        const path = prefix ? `${prefix}.${k}` : k;
        const val = obj[k];
        if (val && typeof val === "object" && !("type" in val)) {
          const deep = findFirstErrorPath(val, path);
          if (deep) return deep;
        } else {
          return path;
        }
      }
      return null;
    },
    []
  );

  /** true se há erro atrelado a algum campo do step */
  const stepHasError = useCallback(
    (idx: number) => {
      const targets = getTargetsForStep(idx);
      const hasFn = (paths: string[], obj: any, base = ""): boolean => {
        for (const key of Object.keys(obj ?? {})) {
          const path = base ? `${base}.${key}` : key;
          if (paths.some((p) => path === p || path.startsWith(`${p}.`)))
            return true;
          const val = obj[key];
          if (val && typeof val === "object" && !("type" in val)) {
            if (hasFn(paths, val, path)) return true;
          }
        }
        return false;
      };
      return hasFn(targets, errors);
    },
    [errors, getTargetsForStep]
  );

  /** valida só o step atual (dinâmico nos passos 2 e 3) */
  const validateCurrent = useCallback(async () => {
    if (!validateOnNext) return true;
    const targets = getTargetsForStep(step);
    const ok = await trigger(targets.length ? targets : undefined, {
      shouldFocus: true,
    });
    if (!ok) {
      const firstErr = findFirstErrorPath(errors);
      if (
        firstErr &&
        (targets.length === 0 ||
          targets.some((f) => firstErr === f || firstErr.startsWith(`${f}.`)))
      ) {
        setFocus(firstErr as any, { shouldSelect: true });
      }
      notifyWarn("Revise os campos desta etapa.");
    }
    return ok;
  }, [
    validateOnNext,
    getTargetsForStep,
    step,
    trigger,
    findFirstErrorPath,
    errors,
    setFocus,
  ]);

  /** rolar o cartão para o título do step */
  const smoothToContentTop = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollAnchorRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }, [prefersReducedMotion]);

  /** próxima etapa, pulando o step3 quando ele estiver desabilitado */
  const computeNextIndex = useCallback(
    (curr: number) => {
      if (curr === 1 && !step3Enabled) return 3; // 2 -> pula 3 -> vai p/ 4
      return Math.min(curr + 1, total - 1);
    },
    [step3Enabled, total]
  );

  /** etapa anterior, voltando por cima do step3 desabilitado */
  const computePrevIndex = useCallback(
    (curr: number) => {
      if (curr === 4 && !step3Enabled) return 2; // 4 -> volta p/ 2 se 3 off
      return Math.max(curr - 1, 0);
    },
    [step3Enabled]
  );

  /** clicar nas pílulas: navegar (com/sem validação) + trava step3 desabilitado */
  const goTo = useCallback(
    async (idx: number) => {
      if (idx === 2 && !step3Enabled) {
        notifyWarn(
          "O passo Clínica é exibido quando HAS e/ou DM estão marcados."
        );
        return;
      }
      if (!freePillNavigation && idx > step) {
        const ok = await validateCurrent();
        if (!ok) return;
      }
      setStep(Math.max(0, Math.min(idx, total - 1)));
      smoothToContentTop();
    },
    [
      freePillNavigation,
      step,
      total,
      validateCurrent,
      smoothToContentTop,
      step3Enabled,
    ]
  );

  const next = useCallback(async () => {
    const ok = await validateCurrent();
    if (!ok) return;
    setStep((s) => computeNextIndex(s));
    smoothToContentTop();
  }, [validateCurrent, computeNextIndex, smoothToContentTop]);

  const prev = useCallback(() => {
    setStep((s) => computePrevIndex(s));
    smoothToContentTop();
  }, [computePrevIndex, smoothToContentTop]);

  // navegação por teclado (ignora quando digitando em inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isFormCtl =
        tag === "input" || tag === "textarea" || tag === "select";
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isFormCtl)
        return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <section className="overflow-hidden rounded-[16px] border border-card bg-content1 shadow-soft">
      {/* Cabeçalho: pílulas + barra de progresso */}
      <header className="px-6 md:px-8 pt-6 pb-4 bg-content1/80">
        <ol
          aria-label="Passos do cadastro"
          className="flex flex-wrap gap-3"
          role="list"
        >
          {STEPS_META.map((s, i) => {
            const active = i === step;
            const hasErr = stepHasError(i);
            const disabled = i === 2 && !step3Enabled;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={disabled}
                  className={[
                    "inline-flex items-center gap-2 h-10 rounded-full border px-4 text-sm transition-colors ring-offset-app focus-visible:outline-none focus-visible:ring-2 ring-focus",
                    active
                      ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                      : "bg-white/70 dark:bg-transparent border-default-200 text-foreground/75 hover:text-foreground",
                    hasErr && !active ? "border-danger text-danger" : "",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                  aria-disabled={disabled || undefined}
                  title={
                    disabled
                      ? "Habilite marcando HAS e/ou DM no passo 2"
                      : undefined
                  }
                >
                  <span className="sr-only">
                    Etapa {i + 1} de {total}:
                  </span>
                  <span
                    className={[
                      "grid place-items-center size-6 rounded-full border text-[12px] font-semibold",
                      active
                        ? "border-white/70 bg-white/15 text-white"
                        : "border-default-200 text-foreground/70",
                    ].join(" ")}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  {s.label}
                  {hasErr && !active && (
                    <span
                      aria-label="há erros nesta etapa"
                      className="ml-1 inline-block size-2 rounded-full bg-danger"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Progresso sutil */}
        <div className="mt-4 h-1 w-full rounded-full bg-content2" aria-hidden>
          <div
            className="h-1 rounded-full bg-[var(--brand)] transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </header>

      {/* Âncora para manter rolagem estável ao trocar de passo */}
      <div ref={scrollAnchorRef} />

      {/* Conteúdo dos steps */}
      <div className="px-6 md:px-8 py-6 md:py-8 space-y-8">
        {step === 0 && <Step1 />}
        {step === 1 && <Step2 />}
        {step === 2 && <Step3 />}
        {step === 3 && <Step4 />}
        {step === 4 && <Step5 />}
      </div>

      {/* Rodapé de ações */}
      <footer className="border-t border-divider px-6 md:px-8 py-4 bg-content1/90">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="flat"
            onClick={prev}
            isDisabled={step === 0 || isSubmitting}
            radius="full"
            className="min-w-[120px]"
          >
            Voltar
          </Button>

          {step < total - 1 ? (
            <Button
              type="button"
              className="btn-brand min-w-[160px]"
              onClick={next}
              radius="full"
              isDisabled={isSubmitting}
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="button"
              className="btn-brand min-w-[200px]"
              onClick={onSubmit}
              radius="full"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Enviando…" : "Finalizar registro"}
            </Button>
          )}
        </div>
      </footer>
    </section>
  );
}
