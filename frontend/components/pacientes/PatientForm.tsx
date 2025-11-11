// components/pacientes/PatientForm.tsx
"use client";

import PatientWizard from "@/components/pacientes/PatientWizard";
import { notifyError, notifySuccess, notifyWarn } from "@/components/ui/notify";
import {
  RegistroPacienteCreateZ,
  RegistroPacienteEditZ,
  type RegistroPacienteCreate,
  type RegistroPacienteEdit,
} from "@/schemas/paciente";
import { Card, CardBody } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

// Helpers de API
import { createDM, createHAS, updateDM, updateHAS } from "@/lib/api/conditions";
import { createPaciente, updatePaciente } from "@/lib/api/pacientes";
import {
  formToDmApi,
  formToHasApi,
  formToPatientApi,
} from "@/lib/pacientes/mappers";

/* ===========================
   Tipos de INPUT (pré-Zod)
   =========================== */
type CreateFormInput = z.input<typeof RegistroPacienteCreateZ>;
type EditFormInput = z.input<typeof RegistroPacienteEditZ>;

/* ===========================
   Props
   =========================== */
type Props =
  | { mode: "create"; defaultValues?: Partial<CreateFormInput> }
  | {
      mode: "edit";
      id: number;
      defaultValues: CreateFormInput;
      hasId?: number | null;
      dmId?: number | null;
    };

/* ===========================
   Defaults (Create)
   =========================== */
const CREATE_DEFAULTS: CreateFormInput = {
  socio: {
    nome: "",
    nascimento: undefined as unknown as string, // RHF input; Zod faz coerce depois
    genero: "M",
    genero_outro: "",
    raca_etnia: "nao_informado",
    sus_cpf: "",
    telefone: "",
    whatsapp: false,
    endereco: {
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "" as any,
      cep: "",
    },
    n_pessoas_domicilio: undefined,
    responsavel_familiar: "",
    renda_familiar: undefined,
    bolsa_familia: false,
    escolaridade: "sem_escolaridade",
    ocupacao: "",
    estado_civil: "solteiro",
  },
  condicoes: {
    has: false,
    dm: false,
    outras_dcnts: "",
    outras_em_acompanhamento: undefined,
  },
  clinica: { has: undefined, dm: undefined },
  multiprof: undefined,
  plano: undefined,
};

/* ===========================
   Rascunho por usuário
   =========================== */

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

/**
 * Gera uma chave de rascunho por usuário logado, para evitar
 * que usuários diferentes, no mesmo navegador, vejam o mesmo rascunho.
 */
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

/* ===========================
   Componente
   =========================== */
export default function PatientForm(props: Props) {
  const isCreate = props.mode === "create";
  const schema = isCreate ? RegistroPacienteCreateZ : RegistroPacienteEditZ;
  const router = useRouter();

  const methods = useForm<CreateFormInput | EditFormInput>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? ({
          ...CREATE_DEFAULTS,
          ...(props.defaultValues ?? {}),
        } as CreateFormInput)
      : (props.defaultValues as EditFormInput),
    mode: "onChange",
    reValidateMode: "onBlur",
    shouldFocusError: true,
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    setFocus,
    reset,
    watch,
    formState: { isSubmitting, errors, isDirty },
  } = methods;

  // handler compartilhado (form + wizard)
  const submitHandler = handleSubmit(onValid, onInvalid);

  // refs para controle de rascunho
  const hasMountedRef = useRef(false);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const draftKeyRef = useRef<string | null>(null);

  // snapshot do formulário (para autosave)
  const watchAll = watch();

  const getDraftKey = () => {
    if (!draftKeyRef.current) {
      draftKeyRef.current = getUserScopedDraftKey();
    }
    return draftKeyRef.current;
  };

  // Carrega rascunho salvo no localStorage (apenas no modo create)
  useEffect(() => {
    if (!isCreate) return;
    if (typeof window === "undefined") return;

    const draftKey = getDraftKey();

    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        hasMountedRef.current = true;
        return;
      }

      const draft = JSON.parse(raw);

      const merged = {
        ...CREATE_DEFAULTS,
        ...(props.defaultValues ?? {}),
        ...(draft ?? {}),
      };

      // tenta validar o draft; se estiver muito zoado, ainda assim carrega o merge cru
      const parsed = schema.safeParse(merged);
      reset((parsed.success ? parsed.data : merged) as any);
    } catch (e) {
      console.error("Falha ao carregar rascunho", e);
    } finally {
      hasMountedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreate, reset]);

  // Autosave de rascunho (apenas create, escopado por usuário)
  useEffect(() => {
    if (!isCreate) return;
    if (typeof window === "undefined") return;
    if (!hasMountedRef.current) return;

    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = window.setTimeout(() => {
      try {
        const draftKey = getDraftKey();
        window.localStorage.setItem(draftKey, JSON.stringify(watchAll));
        notifySuccess("Rascunho salvo.");
      } catch (e) {
        console.error("Falha ao salvar rascunho", e);
      }
    }, 1000);

    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchAll, isCreate]);

  function onInvalid() {
    const findFirstPath = (obj: any, prefix = ""): string | null => {
      for (const k of Object.keys(obj ?? {})) {
        const path = prefix ? `${prefix}.${k}` : k;
        const val = obj[k];
        if (val && typeof val === "object" && !("type" in val)) {
          const deep = findFirstPath(val, path);
          if (deep) return deep;
        } else {
          return path;
        }
      }
      return null;
    };

    const first = findFirstPath(errors as any);
    if (first) {
      setFocus(first as any, { shouldSelect: true });
    }
    notifyWarn("Revise os campos destacados antes de continuar.");
  }

  async function onValid(rawData: CreateFormInput | EditFormInput) {
    try {
      const parsed = schema.parse(rawData);

      // converte o objeto do form no payload que o backend espera para PatientUser
      const apiPayload = formToPatientApi(
        parsed as RegistroPacienteCreate | RegistroPacienteEdit,
        isCreate ? "create" : "edit"
      );

      if (isCreate) {
        // 1) cria o paciente
        const created = await createPaciente<{ id: number }>(apiPayload);
        const patientId = (created as any).id;

        // 2) cria registros de HAS/DM se marcados
        const createData = parsed as RegistroPacienteCreate;

        const hasPayload = formToHasApi(createData, patientId);
        const dmPayload = formToDmApi(createData, patientId);

        if (hasPayload) {
          await createHAS(hasPayload);
        }
        if (dmPayload) {
          await createDM(dmPayload);
        }

        // 3) limpamos o rascunho do usuário atual, já que o registro foi salvo
        if (typeof window !== "undefined") {
          const draftKey = getDraftKey();
          window.localStorage.removeItem(draftKey);
        }

        notifySuccess("Paciente cadastrado com sucesso.");
        // ajuste essa rota se a lista de pacientes estiver em outro caminho
        router.push("/pacientes");
      } else {
        const { id, hasId, dmId } = props as Extract<Props, { mode: "edit" }>;

        // 1) atualiza dados do paciente
        await updatePaciente(id, apiPayload);

        const editData = parsed as RegistroPacienteEdit;

        // 2) atualiza HAS, se existir registro
        if (hasId) {
          const hasPayload = formToHasApi(editData as any, id);
          if (hasPayload) {
            await updateHAS(hasId, hasPayload);
          }
        }

        // 3) atualiza DM, se existir registro
        if (dmId) {
          const dmPayload = formToDmApi(editData as any, id);
          if (dmPayload) {
            await updateDM(dmId, dmPayload);
          }
        }

        notifySuccess("Dados do paciente atualizados.");
        router.push("/pacientes");
      }
    } catch (err: any) {
      console.error("ERRO AO SALVAR PACIENTE", err);
      const msg =
        err?.message ??
        err?.response?.data?.detail ??
        "Não foi possível salvar. Tente novamente.";
      notifyError("Erro ao salvar", msg);
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        id="patient-form"
        onSubmit={submitHandler}
        noValidate
        aria-busy={isSubmitting}
      >
        <Card
          shadow="none"
          className="border-none shadow-soft bg-transparent"
          classNames={{ base: "overflow-visible" }}
        >
          <CardBody className="p-0">
            <PatientWizard onSubmit={submitHandler} />
          </CardBody>
        </Card>

        {/* Submit “fantasma” para Enter em inputs */}
        <button type="submit" className="hidden" disabled={isSubmitting} />

        {/* A11y live region */}
        <span className="sr-only" aria-live="polite">
          {isSubmitting
            ? "Enviando…"
            : isDirty
              ? "Alterações não salvas."
              : "Sem alterações."}
        </span>
      </form>
    </FormProvider>
  );
}
