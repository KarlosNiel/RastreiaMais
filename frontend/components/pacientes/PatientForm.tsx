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
import { useEffect } from "react";
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
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = methods;

  // handler compartilhado (form + wizard)
  const submitHandler = handleSubmit(onValid, onInvalid);

  // Carrega rascunho salvo no localStorage (apenas no modo create)
  useEffect(() => {
    if (!isCreate) return;
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("rastreia:paciente:draft");
      if (!raw) return;

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreate, reset]);

  function onInvalid() {
    // DEBUG: ver exatamente o que o RHF/Zod está reclamando
    console.log("[PatientForm] onInvalid disparado. Errors:", errors);

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
      console.log("[PatientForm] Primeiro campo com erro:", first);
      setFocus(first as any, { shouldSelect: true });
    }
    notifyWarn("Revise os campos destacados antes de continuar.");
  }

  async function onValid(rawData: CreateFormInput | EditFormInput) {
    console.log(
      "[PatientForm] onValid disparado. Dados crus do form:",
      rawData
    );

    try {
      // o resolver já validou, então podemos confiar em rawData;
      // ainda assim, garantimos coerções extras com Zod
      const parsed = schema.parse(rawData);
      console.log("[PatientForm] Dados após Zod.parse:", parsed);

      // converte o objeto do form no payload que o backend espera para PatientUser
      const apiPayload = formToPatientApi(
        parsed as RegistroPacienteCreate | RegistroPacienteEdit,
        isCreate ? "create" : "edit"
      );
      console.log("[PatientForm] Payload para API (Paciente):", apiPayload);

      if (isCreate) {
        console.log("[PatientForm] Modo CREATE: criando paciente…");

        // 1) cria o paciente
        const created = await createPaciente<{ id: number }>(apiPayload);
        console.log("[PatientForm] Resposta createPaciente:", created);

        const patientId = (created as any).id;
        console.log("[PatientForm] ID do paciente criado:", patientId);

        // 2) cria registros de HAS/DM se marcados
        const createData = parsed as RegistroPacienteCreate;

        const hasPayload = formToHasApi(createData, patientId);
        const dmPayload = formToDmApi(createData, patientId);

        console.log("[PatientForm] Payload HAS:", hasPayload);
        console.log("[PatientForm] Payload DM:", dmPayload);

        if (hasPayload) {
          console.log("[PatientForm] Enviando createHAS…");
          await createHAS(hasPayload);
        }
        if (dmPayload) {
          console.log("[PatientForm] Enviando createDM…");
          await createDM(dmPayload);
        }

        // 3) limpamos o rascunho, já que o registro foi salvo
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("rastreia:paciente:draft");
        }

        notifySuccess("Paciente cadastrado com sucesso.");
      } else {
        console.log("[PatientForm] Modo EDIT: atualizando paciente…");

        const { id, hasId, dmId } = props as Extract<Props, { mode: "edit" }>;
        console.log(
          "[PatientForm] IDs -> paciente:",
          id,
          "HAS:",
          hasId,
          "DM:",
          dmId
        );

        // 1) atualiza dados do paciente
        await updatePaciente(id, apiPayload);
        console.log("[PatientForm] updatePaciente concluído.");

        const editData = parsed as RegistroPacienteEdit;

        // 2) atualiza HAS, se existir registro
        if (hasId) {
          const hasPayload = formToHasApi(editData as any, id);
          console.log("[PatientForm] Payload HAS (edit):", hasPayload);
          if (hasPayload) {
            console.log("[PatientForm] Enviando updateHAS…");
            await updateHAS(hasId, hasPayload);
          }
        }

        // 3) atualiza DM, se existir registro
        if (dmId) {
          const dmPayload = formToDmApi(editData as any, id);
          console.log("[PatientForm] Payload DM (edit):", dmPayload);
          if (dmPayload) {
            console.log("[PatientForm] Enviando updateDM…");
            await updateDM(dmId, dmPayload);
          }
        }

        notifySuccess("Dados do paciente atualizados.");
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
          className="border border-default-200 shadow-soft"
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
