"use client";

import { notifySuccess, notifyWarn } from "@/components/ui/notify";
import { Button, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import Step1, { STEP1_FIELDS } from "./sections/Step1Sociodemo";
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

const DEFAULT_FIELDS: string[][] = [[], [], [], [], []];

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
          f !== "condicoes.outras_em_acompanhamento"
      ),
    []
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
    [fieldsByStep, has, dm, step3Enabled, STEP2_REQUIRED]
  );

  const [step, setStep] = useState(0);
  const total = STEPS_META.length;

  useEffect(() => {
    if (step === 2 && !step3Enabled) setStep(3);
  }, [step, step3Enabled]);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const percent = useMemo(() => Math.round(((step + 1) / total) * 100), [step, total]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const findFirstErrorPath = useCallback((obj: any, prefix = ""): string | null => {
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
  }, []);

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

  const validateCurrent = useCallback(async () => {
    if (!validateOnNext) return true;
    const targets = getTargetsForStep(step);
    if (!targets.length) return true;
    const ok = await trigger(targets, { shouldFocus: false });
    if (ok) return true;
    const hasErrInCurrent = targets.some((t) => getFieldState(t).invalid);
    if (!hasErrInCurrent) return true;
    const firstErr = findFirstErrorPath(errors);
    if (firstErr && targets.some((f) => firstErr === f || firstErr.startsWith(`${f}.`))) {
      setFocus(firstErr as any, { shouldSelect: true });
    }
    notifyWarn("Revise os campos desta etapa.");
    return false;
  }, [validateOnNext, getTargetsForStep, step, trigger, getFieldState, findFirstErrorPath, errors, setFocus]);

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
    [step3Enabled, total]
  );

  const computePrevIndex = useCallback(
    (curr: number) => {
      if (curr === 3 && !step3Enabled) return 1;
      return Math.max(curr - 1, 0);
    },
    [step3Enabled]
  );

  const goTo = useCallback(
    async (idx: number) => {
      if (idx === 2 && !step3Enabled) {
        notifyWarn("O passo Clínica é exibido quando HAS e/ou DM estão marcados.");
        return;
      }
      if (!freePillNavigation && idx > step) {
        const ok = await validateCurrent();
        if (!ok) return;
      }
      setStep(Math.max(0, Math.min(idx, total - 1)));
      smoothToContentTop();
    },
    [freePillNavigation, step, total, validateCurrent, smoothToContentTop, step3Enabled]
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isFormCtl = tag === "input" || tag === "textarea" || tag === "select";
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isFormCtl)
        return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

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
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)}>
        <ModalContent>
          <ModalHeader>Cancelar preenchimento</ModalHeader>
          <ModalBody>
            Tem certeza que deseja cancelar? Informações não salvas serão perdidas.
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={() => setCancelModal(false)}>
              Voltar
            </Button>
            <Button color="danger" onClick={confirmCancel}>
              Cancelar mesmo assim
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <section className="overflow-hidden rounded-lg border-none bg-transparent backdrop-blur-sm container mx-auto px-4 sm:px-6 lg:px-8 my-8 transition-colors">
        <header className="pt-6 pb-4 bg-transparent backdrop-blur-sm rounded-t-lg border-gray-800 transition-colors">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <ol aria-label="Passos do cadastro" className="flex flex-wrap gap-3" role="list">
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
                        "inline-flex items-center gap-2 h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ring-offset-app ring-orange-600",
                        active
                          ? "bg-orange-600 text-white border-orange-600"
                          : "dark:bg-gray-800 bg-white border-orange-600 dark:border-none text-black dark:text-white hover:bg-gray-100 hover:text-black",
                        hasErr && !active ? "border-red-600 text-red-500" : "",
                        disabled ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                      aria-current={active ? "step" : undefined}
                      aria-disabled={disabled || undefined}
                      title={disabled ? "Habilite marcando HAS e/ou DM no passo 2" : undefined}
                    >
                      <span className="sr-only">
                        Etapa {i + 1} de {total}:
                      </span>
                      <span
                        className={[
                          "grid place-items-center size-6 rounded-full border text-[12px] font-semibold",
                          active
                            ? "border-white/70 bg-white/20 text-white"
                            : "border-gray-600 text-gray-400",
                        ].join(" ")}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      {s.label}
                      {hasErr && !active && <span className="ml-1 inline-block size-2 rounded-full bg-red-600" />}
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button
                type="button"
                variant="light"
                radius="full"
                onClick={handleCancel}
                isDisabled={isSubmitting}
                className="border border-orange-600 text-black bg-transparent hover:bg-red-600 dark:bg-gray-800 dark:border-none dark:text-white dark:hover:bg-red-600 transition"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="flat"
                radius="full"
                onClick={handleSaveDraft}
                isDisabled={isSubmitting}
                className="border border-orange-600 hover:bg-gray-200 text-black bg-transparent dark:bg-gray-800 dark:border-none dark:hover:bg-blue-600 dark:text-white transition"
              >
                Salvar Rascunho
              </Button>
              <Button
                type="button"
                className="bg-orange-600 hover:bg-orange-500 text-white radius-full transition"
                radius="full"
                onClick={handleSubmitClick}
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Enviando…" : "Finalizar Registro"}
              </Button>
            </div>
          </div>

          <div
            className="mt-4 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-800 transition-colors"
            aria-hidden
          >
            <div
              className="h-1 rounded-full bg-orange-600 transition-[width] duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>

        <div className="py-6 md:py-8 space-y-8 transition-colors">
          {step === 0 && <Step1 />}
          {step === 1 && <Step2 />}
          {step === 2 && <Step3 />}
          {step === 3 && <Step4 />}
          {step === 4 && <Step5 />}
        </div>

        <footer className="border-none border-gray-800 bg-transparent px-4 sm:px-6 lg:px-8 py-0 rounded-b-lg transition-colors">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="flat"
              onClick={prev}
              isDisabled={step === 0 || isSubmitting}
              radius="full"
              className="min-w-[120px] border border-orange-600 text-gray-black bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              Voltar
            </Button>

            {step < total - 1 ? (
              <Button
                type="button"
                className="bg-orange-600 hover:bg-orange-500 text-white radius-full min-w-[160px] transition"
                onClick={next}
                radius="full"
                isDisabled={isSubmitting}
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-orange-600 hover:bg-orange-500 text-white radius-full min-w-[200px] transition"
                onClick={handleSubmitClick}
                radius="full"
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Enviando…" : "Finalizar registro"}
              </Button>
            )}
          </div>
        </footer>
      </section>
    </>
  );
}
