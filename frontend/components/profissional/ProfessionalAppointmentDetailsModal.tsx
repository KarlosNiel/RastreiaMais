"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import {
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { AgendaRow } from "./AgendaTable";

import { StatusChip } from "@/components/ui/StatusChip";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: AgendaRow | null;
  onDone?: (row: AgendaRow) => void;
  onCancel?: (row: AgendaRow) => void;
}

export default function ProfessionalAppointmentDetailsModal({
  open,
  onClose,
  data,
  onDone,
  onCancel,
}: Props) {
  if (!data) return null;

  const getRiskColor = (risco: string) => {
    switch (risco) {
      case "critical":
        return "text-rose-600 dark:text-rose-400";
      case "moderate":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-emerald-600 dark:text-emerald-400";
    }
  };

  const getRiskLabel = (risco: string) => {
    switch (risco) {
      case "critical":
        return "Alto risco";
      case "moderate":
        return "Risco moderado";
      default:
        return "Baixo risco";
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden",
        header: "border-b border-slate-100 dark:border-zinc-800/80 pb-4 pt-5 px-6",
        body: "py-5 px-6 space-y-3",
        footer:
          "border-t border-slate-100 dark:border-zinc-800/80 py-4 px-6 bg-slate-50/50 dark:bg-zinc-900/50",
      }}
      isOpen={open}
      size="lg"
      onOpenChange={onClose}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-3 text-slate-900 dark:text-zinc-100">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">
                  Detalhes do Agendamento
                </h2>
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                  Informações completas da consulta
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-3">
              {/* Paciente */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                  <UserIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                    Paciente
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {data.paciente}
                  </p>
                  {data.docMasked && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
                      CPF / Documento: {data.docMasked}
                    </p>
                  )}
                </div>
              </div>

              {/* Condição */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                  <HeartIcon className="size-5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                    Condição Clínica / Diagnóstico
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {data.condicao && data.condicao !== "—"
                      ? data.condicao
                      : "Sem diagnóstico crônico específico"}
                  </p>
                </div>
              </div>

              {/* Local e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                    <MapPinIcon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                      Local
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">
                      {data.local}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                    <ClockIcon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                      Horário
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {data.hora}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status e Risco */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                    Status
                  </p>
                  <StatusChip
                    size="sm"
                    tone={
                      data.status === "finalizado"
                        ? "safe"
                        : data.status === "cancelado"
                          ? "critical"
                          : "attention"
                    }
                  >
                    {data.status === "finalizado"
                      ? "Finalizado"
                      : data.status === "cancelado"
                        ? "Cancelado"
                        : "Ativo"}
                  </StatusChip>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                    Nível de Risco
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${
                        data.risco === "critical"
                          ? "bg-rose-500 animate-pulse"
                          : data.risco === "moderate"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${getRiskColor(data.risco)}`}
                    >
                      {getRiskLabel(data.risco)}
                    </span>
                  </div>
                </div>
              </div>

              {data.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    Observações
                  </p>
                  <p className="text-xs text-slate-700 dark:text-zinc-300">
                    {data.description}
                  </p>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div>
                {data.patientId ? (
                  <Button
                    as={Link}
                    className="font-medium text-xs text-primary bg-primary/10 hover:bg-primary/20"
                    endContent={
                      <ArrowTopRightOnSquareIcon className="size-3.5" />
                    }
                    href={`/pacientes/${data.patientId}/editar`}
                    size="sm"
                  >
                    Ver Prontuário
                  </Button>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2">
                {data.status === "ativo" && onCancel && (
                  <Button
                    className="font-medium text-xs"
                    color="danger"
                    size="sm"
                    startContent={<XMarkIcon className="size-3.5" />}
                    variant="light"
                    onPress={() => onCancel(data)}
                  >
                    Cancelar
                  </Button>
                )}

                {data.status === "ativo" && onDone && (
                  <Button
                    className="font-medium text-xs text-white shadow-2xs"
                    color="primary"
                    size="sm"
                    startContent={
                      <CheckIcon className="size-3.5" strokeWidth={2.5} />
                    }
                    onPress={() => onDone(data)}
                  >
                    Finalizar Atendimento
                  </Button>
                )}

                <Button
                  className="font-medium text-xs"
                  size="sm"
                  variant="bordered"
                  onPress={close}
                >
                  Fechar
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
