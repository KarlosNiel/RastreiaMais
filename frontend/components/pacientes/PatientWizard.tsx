"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import Step1, { STEP1_FIELDS } from "./sections/Step1Sociodemo";
import Step2, { STEP2_FIELDS } from "./sections/Step2Condicoes";
import Step3, { getStep3FieldsDynamic } from "./sections/Step3Clinica";
import Step4 from "./sections/Step4Multiprof";
import Step5 from "./sections/Step5Plano";
import Step6 from "./sections/Step6Resumo";

import { notifySuccess, notifyWarn } from "@/components/ui/notify";

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
  { key: "s6", label: "Resumo" },
] as const;

const DEFAULT_FIELDS: string[][] = [[], [], [], [], [], []];

const BASE_DRAFT_KEY = "rastreia:paciente:draft";

function decodeJwtPayload(token: string): any | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getUserScopedDraftKey(): string {
  if (typeof window === "undefined") return `${BASE_DRAFT_KEY}:anon`;
  try {
    const token =
      localStorage.getItem("access") || sessionStorage.getItem("access");

    if (!token) return `${BASE_DRAFT_KEY}:anon`;
    const payload = decodeJwtPayload(token) ?? {};
    const uid = payload.user_id ?? payload.sub ?? payload.username ?? "anon";

    return `${BASE_DRAFT_KEY}:${uid}`;
  } catch {
    return `${BASE_DRAFT_KEY}:anon`;
  }
}

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
    getFieldState,
    getValues,
    formState: { errors, isSubmitting },
  } = useFormContext();

  const has = watch("condicoes.has");
  const dm = watch("condicoes.dm");
  const step3Enabled = !!has || !!dm;

  const STEP2_REQUIRED = useMemo(
    () =>
      STEP2_FIELDS.filter(
        (f) =>
          f !== "condicoes.outras_dcnts" &&
          f !== "condicoes.outras_em_acompanhamento",
      ),
    [],
  );

  const fieldsByStep =
    stepFields?.length === STEPS_META.length ? stepFields : DEFAULT_FIELDS;

  const getTargetsForStep = useCallback(
    (idx: number): string[] => {
      if (idx === 0) return Array.from(STEP1_FIELDS);
      if (idx === 1) return STEP2_REQUIRED;
      if (idx === 2) {
        if (!step3Enabled) return [];

        return getStep3FieldsDynamic({ has: !!has, dm: !!dm }).map(String);
      }
      if (idx === 3) return [];
      if (idx === 4) return [];

      return fieldsByStep[idx] ?? [];
    },
    [fieldsByStep, has, dm, step3Enabled, STEP2_REQUIRED],
  );

  const [step, setStep] = useState(0);
  const total = STEPS_META.length;

  useEffect(() => {
    if (step === 2 && !step3Enabled) setStep(3);
  }, [step, step3Enabled]);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const percent = useMemo(
    () => Math.round(((step + 1) / total) * 100),
    [step, total],
  );

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

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
    [],
  );

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
    [errors, getTargetsForStep],
  );

  const validateCurrent = useCallback(async () => {
    if (!validateOnNext) return true;
    const targets = getTargetsForStep(step);

    if (!targets.length) return true;
    const ok = await trigger(targets, { shouldFocus: false });

    if (ok) return true;
    const hasErrInCurrent = targets.some((t) => getFieldState(t).invalid);

    if (!hasErrInCurrent) return true;
    const firstErr = findFirstErrorPath(errors);

    if (
      firstErr &&
      targets.some((f) => firstErr === f || firstErr.startsWith(`${f}.`))
    ) {
      setFocus(firstErr as any, { shouldSelect: true });
    }
    notifyWarn("Revise os campos desta etapa.");

    return false;
  }, [
    validateOnNext,
    getTargetsForStep,
    step,
    trigger,
    getFieldState,
    findFirstErrorPath,
    errors,
    setFocus,
  ]);

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

  const computeNextIndex = useCallback(
    (curr: number) => {
      if (curr === 1 && !step3Enabled) return 3;

      return Math.min(curr + 1, total - 1);
    },
    [step3Enabled, total],
  );

  const computePrevIndex = useCallback(
    (curr: number) => {
      if (curr === 3 && !step3Enabled) return 1;

      return Math.max(curr - 1, 0);
    },
    [step3Enabled],
  );

  const goTo = useCallback(
    async (idx: number) => {
      if (idx === 2 && !step3Enabled) {
        notifyWarn(
          "O passo Clínica é exibido quando HAS e/ou DM estão marcados.",
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
    ],
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

  const handleSaveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const draftKey = getUserScopedDraftKey();
      const values = getValues();

      window.localStorage.setItem(draftKey, JSON.stringify(values));
      notifySuccess("Rascunho salvo.");
    } catch {
      notifyWarn("Não foi possível salvar o rascunho.");
    }
  }, [getValues]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Atalho de salvar rascunho (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveDraft();

        return;
      }

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
  }, [next, prev, handleSaveDraft]);

  const [cancelModal, setCancelModal] = useState(false);

  const handleCancel = useCallback(() => {
    setCancelModal(true);
  }, []);

  const confirmCancel = useCallback(() => {
    setCancelModal(false);
    try {
      const draftKey = getUserScopedDraftKey();

      window.localStorage.removeItem(draftKey);
    } catch {}
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  }, []);

  const handleSubmitClick = useCallback(() => {
    if (isSubmitting) return;
    onSubmit();
  }, [isSubmitting, onSubmit]);

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-1 max-w-sm",
          header: "pb-2 pt-5 px-5",
          body: "py-2 px-5",
          footer: "pt-4 pb-5 px-5",
        }}
        isOpen={cancelModal}
        placement="center"
        size="sm"
        onClose={() => setCancelModal(false)}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 shrink-0">
              <ExclamationTriangleIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cancelar Cadastro
              </h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              Tem certeza que deseja cancelar? Todas as alterações não salvas serão
              perdidas.
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-2.5">
            <Button
              className="font-medium text-slate-700 dark:text-zinc-300"
              radius="md"
              size="sm"
              variant="flat"
              onPress={() => setCancelModal(false)}
            >
              Continuar Editando
            </Button>
            <Button
              className="font-medium shadow-xs"
              color="danger"
              radius="md"
              size="sm"
              onPress={confirmCancel}
            >
              Cancelar Mesmo Assim
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0 transition-colors">
        <header className="pt-2 pb-4 bg-transparent backdrop-blur-sm transition-colors">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <ol
              aria-label="Passos do cadastro"
              className="flex flex-wrap gap-3"
            >
              {STEPS_META.map((s, i) => {
                const active = i === step;
                const hasErr = stepHasError(i);
                const disabled = i === 2 && !step3Enabled;

                return (
                  <li key={s.key}>
                    <button
                      aria-current={active ? "step" : undefined}
                      aria-disabled={disabled || undefined}
                      className={[
                        "inline-flex items-center gap-2 h-9 rounded-lg border px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ring-primary/40",
                        active
                          ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                          : "bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs",
                        hasErr && !active
                          ? "border-rose-400 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20"
                          : "",
                        disabled
                          ? "opacity-40 cursor-not-allowed pointer-events-none"
                          : "",
                      ].join(" ")}
                      disabled={disabled}
                      title={
                        disabled
                          ? "Habilite marcando HAS e/ou DM no passo 2"
                          : undefined
                      }
                      type="button"
                      onClick={() => goTo(i)}
                    >
                      <span className="sr-only">
                        Etapa {i + 1} de {total}:
                      </span>
                      <span
                        aria-hidden
                        className={[
                          "grid place-items-center size-5 rounded-full text-[11px] font-semibold",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300",
                        ].join(" ")}
                      >
                        {i + 1}
                      </span>
                      {s.label}
                      {hasErr && !active && (
                        <span className="ml-1 inline-block size-1.5 rounded-full bg-rose-500" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button
                className="font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
                isDisabled={isSubmitting}
                radius="md"
                size="sm"
                type="button"
                variant="bordered"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
                isDisabled={isSubmitting}
                radius="md"
                size="sm"
                type="button"
                variant="bordered"
                onClick={handleSaveDraft}
              >
                Salvar Rascunho
              </Button>
              <Button
                className="font-medium text-white bg-primary hover:bg-primary/90 shadow-2xs"
                color="primary"
                isDisabled={isSubmitting}
                radius="md"
                size="sm"
                type="button"
                onClick={handleSubmitClick}
              >
                {isSubmitting ? "Enviando…" : "Finalizar Registro"}
              </Button>
            </div>
          </div>

          <div
            aria-hidden
            className="mt-4 h-1 w-full rounded-full bg-slate-100 dark:bg-zinc-800 transition-colors"
          >
            <div
              className="h-1 rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>

        <div className="py-6 space-y-8 transition-colors">
          {step === 0 && <Step1 />}
          {step === 1 && <Step2 />}
          {step === 2 && <Step3 />}
          {step === 3 && <Step4 />}
          {step === 4 && <Step5 />}
          {step === 5 && <Step6 />}
        </div>

        <footer className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 border-t border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg transition-colors">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                className="min-w-[100px] font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
                isDisabled={step === 0 || isSubmitting}
                radius="md"
                type="button"
                variant="bordered"
                onClick={prev}
              >
                Voltar
              </Button>

              <Button
                className="hidden sm:inline-flex font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                isDisabled={isSubmitting}
                radius="md"
                size="sm"
                type="button"
                variant="light"
                onClick={handleSaveDraft}
              >
                Salvar Rascunho
                <kbd className="hidden lg:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-500 dark:text-zinc-400 font-mono">
                  ⌘S
                </kbd>
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Etapa {step + 1} de {total}
              </span>

              {step < total - 1 ? (
                <Button
                  className="min-w-[140px] font-medium text-white bg-primary hover:bg-primary/90 shadow-2xs"
                  color="primary"
                  isDisabled={isSubmitting}
                  radius="md"
                  type="button"
                  onClick={next}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  className="min-w-[180px] font-medium text-white bg-primary hover:bg-primary/90 shadow-2xs"
                  color="primary"
                  isDisabled={isSubmitting}
                  radius="md"
                  type="button"
                  onClick={handleSubmitClick}
                >
                  {isSubmitting ? "Enviando…" : "Finalizar Registro"}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}
