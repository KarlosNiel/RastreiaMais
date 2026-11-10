"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { useAppointments } from "@/lib/hooks/appointments/useAppointments";
import { notifyError, notifySuccess } from "@/components/ui/notify";

export default function AppointmentsModal({
  open,
  onOpenChange,
  appointment,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment?: any | null;
}) {
  const creating = !appointment;
  const { create, remove } = useAppointments();

  const [form, setForm] = useState({
    patient: "",
    professional: "",
    scheduled_datetime: "",
    local: "",
    risk_level: "Seguro",
    type: "Consulta",
    description: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Preenche ao abrir para visualizar
  useEffect(() => {
    setErrorMessage(null);
    setSubmitted(false);

    if (appointment) {
      setForm({
        patient: appointment.patient?.id ? String(appointment.patient.id) : "",
        professional: appointment.professional?.id
          ? String(appointment.professional.id)
          : "",
        scheduled_datetime: appointment.scheduled_datetime?.slice(0, 16) ?? "",
        local: appointment.local?.id ? String(appointment.local.id) : "",
        risk_level: appointment.risk_level ?? "Seguro",
        type: appointment.type ?? "Consulta",
        description: appointment.description ?? "",
      });
    } else {
      setForm({
        patient: "",
        professional: "",
        scheduled_datetime: "",
        local: "",
        risk_level: "Seguro",
        type: "Consulta",
        description: "",
      });
    }
  }, [appointment, open]);

  const onSubmit = async () => {
    setSubmitted(true);
    setErrorMessage(null);

    if (!form.patient || !form.scheduled_datetime) {
      setErrorMessage(
        "Por favor, preencha todos os campos obrigatórios assinalados.",
      );

      return;
    }

    try {
      await create.mutateAsync(form);
      notifySuccess("Agendamento criado com sucesso!");
      onOpenChange(false);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível salvar o agendamento.";

      setErrorMessage(detail);
      notifyError("Erro ao salvar agendamento", detail);
    }
  };

  const onDelete = async () => {
    if (!appointment) return;
    try {
      await remove.mutateAsync(appointment.id);
      notifySuccess("Agendamento removido com sucesso!");
      onOpenChange(false);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Falha ao excluir agendamento.";

      notifyError("Erro ao remover", detail);
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 max-w-lg",
        header:
          "border-b border-slate-100 dark:border-zinc-800/80 pb-4 pt-5 px-6",
        body: "py-5 px-6",
        footer:
          "border-t border-slate-100 dark:border-zinc-800/80 py-4 px-6 bg-slate-50/50 dark:bg-zinc-900/50",
      }}
      isOpen={open}
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400">
            <CalendarDaysIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {creating ? "Novo Agendamento" : "Detalhes do Agendamento"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              {creating
                ? "Preencha os dados clínicos da consulta"
                : "Edite ou consulte as informações"}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs">
              <ExclamationCircleIcon className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Paciente */}
          <Input
            isRequired
            disabled={!creating}
            errorMessage={
              submitted && !form.patient ? "ID do paciente é obrigatório" : ""
            }
            isInvalid={submitted && !form.patient}
            label="ID do Paciente"
            placeholder="Ex: 1"
            size="sm"
            value={String(form.patient)}
            variant="bordered"
            onChange={(e) => setForm({ ...form, patient: e.target.value })}
          />

          {/* Data e hora */}
          <Input
            isRequired
            errorMessage={
              submitted && !form.scheduled_datetime
                ? "Data e horário são obrigatórios"
                : ""
            }
            isInvalid={submitted && !form.scheduled_datetime}
            label="Data e Hora"
            size="sm"
            type="datetime-local"
            value={form.scheduled_datetime}
            variant="bordered"
            onChange={(e) =>
              setForm({ ...form, scheduled_datetime: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tipo */}
            <Select
              label="Tipo de Atendimento"
              selectedKeys={[form.type]}
              size="sm"
              variant="bordered"
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <SelectItem key="Consulta">Consulta</SelectItem>
              <SelectItem key="Retorno">Retorno</SelectItem>
              <SelectItem key="Avaliação">Avaliação</SelectItem>
              <SelectItem key="Outro">Outro</SelectItem>
            </Select>

            {/* Risco */}
            <Select
              label="Estratificação de Risco"
              selectedKeys={[form.risk_level]}
              size="sm"
              variant="bordered"
              onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
            >
              <SelectItem key="Seguro">Seguro</SelectItem>
              <SelectItem key="Moderado">Moderado</SelectItem>
              <SelectItem key="Crítico">Crítico</SelectItem>
            </Select>
          </div>

          <Textarea
            label="Observações Clínicas"
            placeholder="Informações adicionais sobre o atendimento..."
            rows={3}
            size="sm"
            value={form.description}
            variant="bordered"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </ModalBody>

        <ModalFooter className="flex justify-between items-center">
          <div>
            {!creating && (
              <Button
                className="font-medium"
                color="danger"
                isLoading={remove.isPending}
                radius="md"
                size="sm"
                variant="flat"
                onPress={onDelete}
              >
                Excluir
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              className="font-medium text-slate-700 dark:text-zinc-300"
              radius="md"
              size="sm"
              variant="flat"
              onPress={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="font-medium shadow-xs"
              color="primary"
              isLoading={create.isPending}
              radius="md"
              size="sm"
              onPress={onSubmit}
            >
              {creating ? "Criar Agendamento" : "Salvar Alterações"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
