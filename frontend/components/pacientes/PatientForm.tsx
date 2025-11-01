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
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

/* ===========================
   API helpers
   =========================== */
const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

if (!API_BASE) {
  // Aviso cedo em dev para não dar fetch em caminho relativo
  // (em prod você pode trocar por um logger silencioso)
  // eslint-disable-next-line no-console
  console.warn("[PatientForm] API_BASE ausente. Defina NEXT_PUBLIC_API_URL.");
}

async function safeDetail(res: Response) {
  try {
    const j = await res.clone().json();
    return (j as any)?.detail || (j as any)?.message || (j as any)?.error;
  } catch {
    try {
      const t = await res.clone().text();
      return t?.slice(0, 300);
    } catch {
      return undefined;
    }
  }
}

async function createPaciente(payload: RegistroPacienteCreate) {
  const res = await fetch(`${API_BASE}/api/v1/accounts/patients/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await safeDetail(res);
    throw new Error(detail || `Erro ${res.status} ao criar paciente`);
  }
  return res.json();
}

async function updatePaciente(id: number, payload: RegistroPacienteEdit) {
  const res = await fetch(`${API_BASE}/api/v1/accounts/patients/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await safeDetail(res);
    throw new Error(detail || `Erro ${res.status} ao atualizar paciente`);
  }
  return res.json();
}

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
  | { mode: "edit"; id: number; defaultValues: CreateFormInput };

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
   Componente
   =========================== */
export default function PatientForm(props: Props) {
  const isCreate = props.mode === "create";
  const schema = isCreate ? RegistroPacienteCreateZ : RegistroPacienteEditZ;

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
    formState: { isSubmitting, errors, isDirty },
  } = methods;

  // foco no primeiro erro "profundo"
  const onInvalid = () => {
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
    if (first) setFocus(first as any, { shouldSelect: true });
    notifyWarn("Revise os campos destacados antes de continuar.");
  };

  const onValid = async (rawData: CreateFormInput | EditFormInput) => {
    try {
      // usamos parse para garantir coerções (date/number) mesmo após o resolver
      const parsed = schema.parse(rawData);

      if (isCreate) {
        await createPaciente(parsed as RegistroPacienteCreate);
        notifySuccess("Paciente cadastrado com sucesso.");
      } else {
        await updatePaciente(
          (props as Extract<Props, { mode: "edit" }>).id,
          parsed as RegistroPacienteEdit
        );
        notifySuccess("Dados do paciente atualizados.");
      }
    } catch (err: any) {
      const msg =
        err?.message ??
        err?.response?.data?.detail ??
        "Não foi possível salvar. Tente novamente.";
      notifyError("Erro ao salvar", msg);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        noValidate
        aria-busy={isSubmitting}
      >
        <Card
          shadow="none"
          className="border border-default-200 shadow-soft"
          classNames={{ base: "overflow-visible" }}
        >
          <CardBody className="p-0">
            <PatientWizard onSubmit={handleSubmit(onValid, onInvalid)} />
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
