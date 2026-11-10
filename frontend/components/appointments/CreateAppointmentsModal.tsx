"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import { apiGet } from "@/lib/api";
import { useAppointments } from "@/lib/hooks/appointments/useAppointments";
import { notifyError, notifySuccess } from "@/components/ui/notify";
import { capitalizeWords, formatCpf } from "@/lib/utils";

function getTomorrowDefaultTime(): string {
  const d = new Date();

  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function CreateAppointmentsModal({
  open,
  onOpenChange,
  preSelectedPatientId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preSelectedPatientId?: string | null;
}) {
  const { create } = useAppointments();

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [form, setForm] = useState({
    professional_id: "",
    local_id: "",
    scheduled_datetime: getTomorrowDefaultTime(),
    risk_level: "Seguro",
    type: "Consulta",
    description: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Busca de paciente individual caso venha pré-selecionado
  const { data: preSelectedPatient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", preSelectedPatientId],
    queryFn: async () => {
      if (!preSelectedPatientId) return null;

      return apiGet<any>(`/api/v1/accounts/patients/${preSelectedPatientId}/`);
    },
    enabled: open && !!preSelectedPatientId,
  });

  // Lista de todos os pacientes caso o modal seja aberto livremente pelo botão de topo
  const { data: allPatients = [], isLoading: loadingPatientsList } = useQuery({
    queryKey: ["patients-selector"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/accounts/patients/");

      if (Array.isArray(resp)) return resp;
      if (resp && typeof resp === "object" && Array.isArray(resp.results)) {
        return resp.results;
      }

      return [];
    },
    enabled: open && !preSelectedPatientId,
  });

  // Lista de profissionais de saúde
  const { data: professionals = [], isLoading: loadingProfessionals } =
    useQuery({
      queryKey: ["professionals"],
      queryFn: async () => {
        const resp = await apiGet<any>("/api/v1/accounts/professionals/");

        if (Array.isArray(resp)) return resp;
        if (resp && typeof resp === "object" && Array.isArray(resp.results)) {
          return resp.results;
        }

        return [];
      },
      enabled: open,
    });

  // Lista de instituições / UBS
  const { data: institutions = [], isLoading: loadingInstitutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/locations/institutions/");

      if (Array.isArray(resp)) return resp;
      if (resp && typeof resp === "object" && Array.isArray(resp.results)) {
        return resp.results;
      }

      return [];
    },
    enabled: open,
  });

  // Inicializa e pré-seleciona valores inteligentes ao abrir
  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setErrorMessage(null);

      // Preenche o paciente se houver pré-selecionado
      if (preSelectedPatientId) {
        setSelectedPatientId(String(preSelectedPatientId));
      } else {
        setSelectedPatientId("");
      }

      setForm((prev) => ({
        ...prev,
        scheduled_datetime: prev.scheduled_datetime || getTomorrowDefaultTime(),
      }));
    }
  }, [open, preSelectedPatientId]);

  // Pré-seleciona profissional e UBS caso haja apenas 1 opção ou padrões convenientes
  useEffect(() => {
    if (open && professionals.length > 0 && !form.professional_id) {
      setForm((prev) => ({
        ...prev,
        professional_id: String(professionals[0].id),
      }));
    }
  }, [open, professionals, form.professional_id]);

  useEffect(() => {
    if (open && institutions.length > 0 && !form.local_id) {
      setForm((prev) => ({
        ...prev,
        local_id: String(institutions[0].id),
      }));
    }
  }, [open, institutions, form.local_id]);

  const activePatient = useMemo(() => {
    if (preSelectedPatientId && preSelectedPatient) {
      return preSelectedPatient;
    }
    if (selectedPatientId) {
      return allPatients.find(
        (p: any) => String(p.id) === String(selectedPatientId),
      );
    }

    return null;
  }, [
    preSelectedPatientId,
    preSelectedPatient,
    selectedPatientId,
    allPatients,
  ]);

  const onSubmit = async () => {
    setSubmitted(true);
    setErrorMessage(null);

    const targetPatientId = preSelectedPatientId || selectedPatientId;

    if (!targetPatientId) {
      setErrorMessage("Por favor, selecione um paciente para o agendamento.");
      notifyError(
        "Paciente não selecionado",
        "Selecione o paciente que será atendido.",
      );

      return;
    }

    if (!form.professional_id) {
      setErrorMessage("Por favor, selecione um profissional de saúde.");
      notifyError(
        "Profissional não selecionado",
        "Escolha o profissional responsável.",
      );

      return;
    }

    if (!form.local_id) {
      setErrorMessage("Por favor, selecione a instituição de atendimento.");
      notifyError("Local obrigatório", "Selecione a Unidade de Saúde (UBS).");

      return;
    }

    if (!form.scheduled_datetime) {
      setErrorMessage("Por favor, defina a data e o horário da consulta.");
      notifyError(
        "Data e hora obrigatórias",
        "Informe quando a consulta ocorrerá.",
      );

      return;
    }

    const payload: any = {
      patient_id: Number(targetPatientId),
      professional_id: Number(form.professional_id),
      local_id: Number(form.local_id),
      scheduled_datetime: form.scheduled_datetime,
      risk_level: form.risk_level,
      type: form.type,
      status: "ativo",
    };

    if (form.description.trim()) {
      payload.description = form.description.trim();
    }

    try {
      await create.mutateAsync(payload);
      notifySuccess(
        "Agendamento criado com sucesso!",
        "A consulta já está registrada na agenda.",
      );
      onOpenChange(false);
    } catch (err: any) {
      const data = err?.response?.data;
      let msg = "Não foi possível registrar o agendamento.";

      if (data?.scheduled_datetime) {
        msg = Array.isArray(data.scheduled_datetime)
          ? data.scheduled_datetime[0]
          : String(data.scheduled_datetime);
      } else if (data?.detail) {
        msg = String(data.detail);
      } else if (err?.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
      notifyError("Erro ao agendar", msg);
    }
  };

  const isLoading =
    loadingPatient ||
    loadingPatientsList ||
    loadingProfessionals ||
    loadingInstitutions;

  return (
    <Modal
      classNames={{
        base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
      }}
      isOpen={open}
      scrollBehavior="inside"
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-1 pt-6 px-6 dark:text-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <CalendarDaysIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Novo Agendamento
              </h2>
              <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                Preencha os dados clínicos para registrar a consulta na APS
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4 pt-4 pb-6 px-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-2xs">
              <ExclamationCircleIcon className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <span className="font-semibold block">Atenção ao agendar:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Spinner color="warning" size="md" />
              <span className="text-xs text-slate-500">
                Carregando dados da unidade...
              </span>
            </div>
          ) : (
            <>
              {/* Seção Paciente */}
              {preSelectedPatientId && activePatient ? (
                <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Paciente Selecionado
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                      Vinculado
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                    {capitalizeWords(
                      `${activePatient.user?.first_name || ""} ${activePatient.user?.last_name || ""}`,
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                    CPF: {formatCpf(activePatient.cpf) || "Não informado"}
                  </p>
                </div>
              ) : (
                <Select
                  isRequired
                  errorMessage={
                    submitted && !selectedPatientId
                      ? "Selecione um paciente para o atendimento"
                      : ""
                  }
                  isInvalid={submitted && !selectedPatientId}
                  label="Paciente *"
                  placeholder="Selecione o paciente cadastrado"
                  radius="lg"
                  selectedKeys={selectedPatientId ? [selectedPatientId] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0];

                    setSelectedPatientId(String(key || ""));
                    setErrorMessage(null);
                  }}
                >
                  {allPatients.map((p: any) => {
                    const name = capitalizeWords(
                      `${p.user?.first_name || ""} ${p.user?.last_name || ""}`,
                    );
                    const cpfMasked = formatCpf(p.cpf);
                    const label = `${name} (${cpfMasked || "Sem CPF"})`;

                    return (
                      <SelectItem key={String(p.id)} textValue={label}>
                        <div className="flex flex-col py-0.5">
                          <span className="font-medium text-xs text-slate-900 dark:text-zinc-100">
                            {name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            CPF: {cpfMasked || "—"}{" "}
                            {p.conditions ? `• ${p.conditions}` : ""}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </Select>
              )}

              {/* Profissional */}
              <Select
                isRequired
                errorMessage={
                  submitted && !form.professional_id
                    ? "Selecione o profissional de saúde"
                    : ""
                }
                isInvalid={submitted && !form.professional_id}
                label="Profissional *"
                placeholder="Selecione um profissional"
                radius="lg"
                selectedKeys={
                  form.professional_id ? [form.professional_id] : []
                }
                variant="bordered"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];

                  setForm({ ...form, professional_id: String(key || "") });
                  setErrorMessage(null);
                }}
              >
                {professionals.map((p: any) => {
                  const label = `${capitalizeWords(`${p.user?.first_name || ""} ${p.user?.last_name || ""}`)} (${p.role || "Profissional"}${p.professional_registry ? ` • ${p.professional_registry}` : ""})`;

                  return (
                    <SelectItem key={String(p.id)} textValue={label}>
                      {label}
                    </SelectItem>
                  );
                })}
              </Select>

              {/* Instituição / Local */}
              <Select
                isRequired
                errorMessage={
                  submitted && !form.local_id
                    ? "Selecione a Unidade de Saúde (UBS)"
                    : ""
                }
                isInvalid={submitted && !form.local_id}
                label="Instituição / UBS *"
                placeholder="Selecione a unidade de saúde"
                radius="lg"
                selectedKeys={form.local_id ? [form.local_id] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];

                  setForm({ ...form, local_id: String(key || "") });
                  setErrorMessage(null);
                }}
              >
                {institutions.map((i: any) => (
                  <SelectItem key={String(i.id)} textValue={i.name}>
                    {i.name}
                  </SelectItem>
                ))}
              </Select>

              {/* Data e Hora */}
              <Input
                isRequired
                errorMessage={
                  submitted && !form.scheduled_datetime
                    ? "Defina a data e o horário da consulta"
                    : ""
                }
                isInvalid={submitted && !form.scheduled_datetime}
                label="Data e Hora *"
                placeholder="dd/mm/aaaa, --:--"
                radius="lg"
                type="datetime-local"
                value={form.scheduled_datetime}
                variant="bordered"
                onChange={(e) => {
                  setForm({ ...form, scheduled_datetime: e.target.value });
                  setErrorMessage(null);
                }}
              />

              {/* Tipo e Nível de Risco em Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  isRequired
                  label="Tipo *"
                  radius="lg"
                  selectedKeys={[form.type]}
                  variant="bordered"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <SelectItem key="Consulta">Consulta</SelectItem>
                  <SelectItem key="Retorno">Retorno</SelectItem>
                  <SelectItem key="Avaliação">Avaliação</SelectItem>
                  <SelectItem key="Outro">Outro</SelectItem>
                </Select>

                <Select
                  isRequired
                  label="Nível de Risco *"
                  radius="lg"
                  selectedKeys={[form.risk_level]}
                  variant="bordered"
                  onChange={(e) =>
                    setForm({ ...form, risk_level: e.target.value })
                  }
                >
                  <SelectItem key="Seguro">Seguro (Baixo)</SelectItem>
                  <SelectItem key="Moderado">Moderado</SelectItem>
                  <SelectItem key="Crítico">Crítico (Alto)</SelectItem>
                </Select>
              </div>

              {/* Descrição */}
              <Textarea
                label="Descrição / Observações Clínicas"
                minRows={2.5}
                placeholder="Observações complementares ou queixas prévias..."
                radius="lg"
                value={form.description}
                variant="bordered"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              {/* Botões de Ação */}
              <div className="flex justify-end items-center gap-2.5 pt-3">
                <Button
                  className="font-medium text-xs text-slate-700 dark:text-zinc-300"
                  radius="lg"
                  variant="light"
                  onPress={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>

                <Button
                  className="font-semibold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
                  isLoading={create.isPending}
                  radius="lg"
                  onPress={onSubmit}
                >
                  Criar Agendamento
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
