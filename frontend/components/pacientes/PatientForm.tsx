// components/pacientes/PatientForm.tsx
"use client";

import PatientWizard from "@/components/pacientes/PatientWizard";
import { notifyError, notifySuccess, notifyWarn } from "@/components/ui/notify";
import {
  createAddress,
  updateAddress,
  type AddressApiPayload,
} from "@/lib/api/locations";
import {
  RegistroPacienteCreateZ,
  RegistroPacienteEditZ,
  type RegistroPacienteCreate,
  type RegistroPacienteEdit,
} from "@/schemas/paciente";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
      defaultValues: EditFormInput;
      hasId?: number | null;
      dmId?: number | null;
      addressId?: number | null;
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

/**
 * Tenta separar "Rua Tal, 123" ou "Rua Tal 123" em `street` e `number`.
 * Se não encontrar número, usa 1 como fallback (campo é obrigatório e positivo).
 */
function splitStreetAndNumber(raw: string | undefined | null): {
  street: string;
  number: number;
} {
  if (!raw) return { street: "", number: 1 };

  const trimmed = raw.trim();

  // Padrões comuns: "Rua X, 123" ou "Rua X 123"
  const m = trimmed.match(/^(.*?)[,\s]+(\d+)\s*$/);
  if (m) {
    const street = m[1].trim();
    const num = Number(m[2]);
    return {
      street: street || trimmed,
      number: Number.isFinite(num) && num > 0 ? num : 1,
    };
  }

  // Se não bater regex, considera tudo rua e número = 1
  return { street: trimmed, number: 1 };
}

/* ===========================
   Componente
   =========================== */
export default function PatientForm(props: Props) {
  const isCreate = props.mode === "create";
  const schema = isCreate ? RegistroPacienteCreateZ : RegistroPacienteEditZ;
  const router = useRouter();

  const [passwordModal, setPasswordModal] = useState<{
    open: boolean;
    password: string | null;
  }>({
    open: false,
    password: null,
  });

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

      const socio: any = (parsed as any).socio ?? {};
      const endereco = socio?.endereco;

      // id do endereço que veio do backend (via patientApiToForm)
      const existingAddressId: number | null =
        socio?.address_id != null && socio.address_id !== ""
          ? Number(socio.address_id)
          : null;

      // Verifica se o usuário preencheu um endereço minimamente válido
      const hasMinimumAddress =
        endereco &&
        typeof endereco.logradouro === "string" &&
        endereco.logradouro.trim() !== "" &&
        typeof endereco.bairro === "string" &&
        endereco.bairro.trim() !== "" &&
        typeof endereco.cidade === "string" &&
        endereco.cidade.trim() !== "" &&
        !!endereco.uf;

      let addressId: number | null = existingAddressId;

      // Se tiver endereço preenchido, cria/atualiza na API de locations
      if (hasMinimumAddress) {
        const { street, number } = splitStreetAndNumber(endereco.logradouro);

        const addressPayload: AddressApiPayload = {
          uf: endereco.uf,
          city: endereco.cidade,
          district: endereco.bairro,
          street,
          number,
          complement: null,
          zipcode: endereco.cep || null,
        };

        if (isCreate || !existingAddressId) {
          // CREATE ou paciente antigo que ainda não tinha address
          const createdAddress = await createAddress<{ id: number }>(
            addressPayload
          );
          addressId = (createdAddress as any)?.id ?? null;
        } else {
          // EDIT com address já existente → faz UPDATE
          await updateAddress(existingAddressId, addressPayload);
          addressId = existingAddressId;
        }
      } else {
        // Usuário apagou tudo do endereço → remove vínculo
        addressId = null;
      }

      // Monta payload principal do paciente
      const apiPayload = formToPatientApi(
        parsed as RegistroPacienteCreate | RegistroPacienteEdit,
        isCreate ? "create" : "edit"
      );

      // 🔐 captura a senha gerada (se for create)
      let generatedPassword: string | null = null;
      if (isCreate) {
        const userPayload = (apiPayload as any).user;
        if (userPayload && typeof userPayload.password === "string") {
          generatedPassword = userPayload.password;
        }
      }

      // Injeta o id do endereço (ou null se limpou)
      (apiPayload as any).address = addressId;

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

        // 3) limpa rascunho deste usuário
        if (typeof window !== "undefined") {
          const draftKey = getDraftKey();
          window.localStorage.removeItem(draftKey);
        }

        notifySuccess("Paciente cadastrado com sucesso.");

        // Se uma senha inicial foi gerada, exibe modal para o profissional
        if (generatedPassword) {
          setPasswordModal({
            open: true,
            password: generatedPassword,
          });
        } else {
          router.push("/pacientes");
        }
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

      let msg = "Não foi possível salvar. Tente novamente.";

      const data = err?.response;

      if (data && typeof data === "object") {
        // erro de username duplicado (CPF já usado)
        const userErrors = (data as any).user;
        const usernameErr =
          userErrors && Array.isArray(userErrors.username)
            ? userErrors.username[0]
            : null;

        if (usernameErr) {
          msg =
            "Já existe um paciente/usuário com esse CPF. Verifique se ele já está cadastrado antes de criar um novo registro.";
        } else if ((data as any).detail) {
          msg = String((data as any).detail);
        } else if (typeof err.message === "string") {
          msg = err.message;
        }
      } else if (typeof err.message === "string") {
        msg = err.message;
      }

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

      {/* Modal para exibir a senha inicial do paciente */}
      <Modal
        isOpen={passwordModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordModal({ open: false, password: null });
            router.push("/pacientes");
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-base font-semibold">
                Senha inicial do paciente
              </ModalHeader>

              <ModalBody className="space-y-3 text-sm">
                <p>
                  Entregue esta senha ao paciente para o primeiro acesso ao
                  portal. Ela poderá ser alterada depois do login.
                </p>

                <div className="mt-2 mb-1 rounded-lg bg-black/10 px-4 py-3 text-center font-mono text-lg">
                  {passwordModal.password ?? "Senha não disponível"}
                </div>

                <p className="text-xs opacity-80">
                  Por segurança, esta senha não será exibida novamente após
                  fechar esta janela.
                </p>
              </ModalBody>

              <ModalFooter className="flex justify-between">
                <Button
                  variant="light"
                  onPress={() => {
                    if (
                      typeof navigator !== "undefined" &&
                      passwordModal.password
                    ) {
                      navigator.clipboard
                        ?.writeText(passwordModal.password)
                        .catch(() => {});
                    }
                  }}
                >
                  Copiar senha
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose(); // fechar modal → dispara onOpenChange(false) → push("/pacientes")
                  }}
                >
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FormProvider>
  );
}
