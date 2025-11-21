"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { useAppointments } from "@/lib/hooks/appointments/useAppointments";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";

interface CreateAppointmentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preSelectedPatientId?: string | null;
}

export default function CreateAppointmentsModal({
  open,
  onOpenChange,
  preSelectedPatientId,
}: CreateAppointmentModalProps) {
  const { create } = useAppointments();

  const [form, setForm] = useState({
    professional: "",
    scheduled_datetime: "",
    local: "",
    risk_level: "Seguro",
    type: "Consulta",
    description: "",
  });

  // Buscar dados do paciente selecionado
  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", preSelectedPatientId],
    queryFn: async () => {
      if (!preSelectedPatientId) return null;
      const resp = await apiGet<any>(`/api/v1/accounts/patients/${preSelectedPatientId}/`);
      return resp;
    },
    enabled: open && !!preSelectedPatientId,
  });

  // Buscar todos os profissionais
  const { data: professionals = [], isLoading: loadingProfessionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/accounts/professionals/");
      const list = Array.isArray(resp) ? resp : resp?.results || [];
      return list;
    },
    enabled: open,
  });

  // Buscar instituições (locais)
  const { data: institutions = [], isLoading: loadingInstitutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/locations/institutions/");
      const list = Array.isArray(resp) ? resp : resp?.results || [];
      return list;
    },
    enabled: open,
  });

  // Resetar form ao fechar
  useEffect(() => {
    if (!open) {
      setForm({
        professional: "",
        scheduled_datetime: "",
        local: "",
        risk_level: "Seguro",
        type: "Consulta",
        description: "",
      });
    }
  }, [open]);

  const onSubmit = async () => {
    // Validação
    if (!preSelectedPatientId) {
      alert("Paciente não selecionado");
      return;
    }

    if (!form.professional) {
      alert("Por favor, selecione um profissional");
      return;
    }

    if (!form.scheduled_datetime) {
      alert("Por favor, preencha a Data e Hora do agendamento");
      return;
    }

    try {
      await create.mutateAsync({
        patient_id: Number(preSelectedPatientId),
        professional_id: Number(form.professional),
        scheduled_datetime: form.scheduled_datetime,
        local: form.local ? Number(form.local) : null,
        risk_level: form.risk_level,
        type: form.type,
        description: form.description,
        status: "ativo",
      });
      alert("Agendamento criado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      const errorMsg = error?.response?.data?.detail 
        || error?.response?.data?.message 
        || JSON.stringify(error?.response?.data)
        || "Erro ao criar agendamento. Verifique os dados e tente novamente.";
      alert(errorMsg);
    }
  };

  const isLoading = loadingPatient || loadingProfessionals || loadingInstitutions;

  // Função para formatar CPF
  const formatCpf = (cpf?: string) => {
    if (!cpf) return "";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Novo Agendamento</h2>
          <p className="text-sm text-gray-500 font-normal">
            Preencha as informações para criar um novo agendamento
          </p>
        </ModalHeader>

        <ModalBody className="space-y-4 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner color="warning" />
            </div>
          ) : (
            <>
              {/* Informações do Paciente (somente leitura) */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paciente</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {patient?.user?.first_name} {patient?.user?.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  CPF: {formatCpf(patient?.cpf)}
                </p>
              </div>

              {/* Profissional (Select) */}
              <Select
                label="Profissional *"
                placeholder="Selecione o profissional"
                selectedKeys={form.professional ? [form.professional] : []}
                onChange={(e) => setForm({ ...form, professional: e.target.value })}
                classNames={{
                  trigger: "bg-white dark:bg-gray-800 border dark:border-gray-700",
                }}
                isRequired
              >
                {professionals.length > 0 ? (
                  professionals.map((prof: any) => (
                    <SelectItem key={String(prof.id)}>
                      {prof.user?.first_name} {prof.user?.last_name}
                      {prof.specialty ? ` - ${prof.specialty}` : ""}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem key="empty" isDisabled>
                    Nenhum profissional cadastrado
                  </SelectItem>
                )}
              </Select>

              {/* Data e Hora */}
              <Input
                type="datetime-local"
                label="Data e Hora *"
                placeholder="Selecione a data e hora"
                value={form.scheduled_datetime}
                onChange={(e) => setForm({ ...form, scheduled_datetime: e.target.value })}
                classNames={{
                  inputWrapper: "bg-white dark:bg-gray-800 border dark:border-gray-700",
                }}
                isRequired
              />

              {/* Tipo */}
              <Select
                label="Tipo *"
                placeholder="Selecione o tipo"
                selectedKeys={[form.type]}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                classNames={{
                  trigger: "bg-white dark:bg-gray-800 border dark:border-gray-700",
                }}
                isRequired
              >
                <SelectItem key="Consulta">Consulta</SelectItem>
                <SelectItem key="Exame">Exame</SelectItem>
                <SelectItem key="Evento">Evento</SelectItem>
              </Select>

              {/* Nível de Risco */}
              <Select
                label="Nível de Risco *"
                placeholder="Selecione o nível de risco"
                selectedKeys={[form.risk_level]}
                onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
                classNames={{
                  trigger: "bg-white dark:bg-gray-800 border dark:border-gray-700",
                }}
                isRequired
              >
                <SelectItem key="Seguro">Seguro</SelectItem>
                <SelectItem key="Moderado">Moderado</SelectItem>
                <SelectItem key="Crítico">Crítico</SelectItem>
              </Select>

              {/* Local (Instituição) */}
              <Select
                label="Local"
                placeholder="Selecione o local (opcional)"
                selectedKeys={form.local ? [form.local] : []}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                classNames={{
                  trigger: "bg-white dark:bg-gray-800 border dark:border-gray-700",
                }}
              >
                {institutions.length > 0 ? (
                  institutions.map((institution: any) => (
                    <SelectItem key={String(institution.id)}>
                      {institution.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem key="empty" isDisabled>
                    Nenhuma instituição cadastrada
                  </SelectItem>
                )}
              </Select>

              {/* Descrição */}
              <Textarea
                label="Descrição"
                placeholder="Informações adicionais sobre o agendamento (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                minRows={3}
                classNames={{
                  inputWrapper: "bg-white dark:bg-gray-800 border dark:border-gray-700",
                }}
              />

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="flat"
                  onPress={() => onOpenChange(false)}
                  isDisabled={create.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={onSubmit}
                  isLoading={create.isPending}
                  className="text-white"
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