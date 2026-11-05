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
  ClipboardDocumentListIcon,
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { StatusChip } from "@/components/ui/StatusChip";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: any;
}

export default function PatientAppointmentDetailsModal({
  open,
  onClose,
  data,
}: Props) {
  if (!data) return null;

  const getStatusTone = (status: string) => {
    switch (status?.toLowerCase()) {
      case "finalizado":
      case "concluído":
        return "safe";
      case "cancelado":
        return "critical";
      case "ativo":
      case "agendado":
        return "attention";
      default:
        return "neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "finalizado":
      case "concluído":
        return "Finalizado";
      case "cancelado":
        return "Cancelado";
      case "ativo":
        return "Ativo";
      case "agendado":
        return "Agendado";
      default:
        return status || "—";
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xl rounded-2xl",
        header: "border-b border-slate-100 dark:border-zinc-800/80 px-6 pt-6 pb-4",
        body: "py-6 px-6 space-y-4",
        footer: "border-t border-slate-100 dark:border-zinc-800/80 px-6 py-4 bg-slate-50/50 dark:bg-zinc-900/50",
      }}
      isOpen={open}
      size="lg"
      onOpenChange={onClose}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-3 text-slate-900 dark:text-zinc-100">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <ClipboardDocumentListIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Detalhes do Atendimento
                </h2>
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                  Informações da consulta agendada na Rede APS
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-3.5">
              {/* Profissional */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                  <UserIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">
                    Profissional de Saúde
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {data.profissional || "Não informado"}
                  </p>
                </div>
              </div>

              {/* Cargo / Especialidade */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                  <BriefcaseIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">
                    Especialidade / Função
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {data.cargo || "Clínica Geral"}
                  </p>
                </div>
              </div>

              {/* Local */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                  <MapPinIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">
                    Local de Atendimento (UBS)
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {data.local || "UBS Jardim Magnólia"}
                  </p>
                </div>
              </div>

              {/* Data e Horário em Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                    <CalendarIcon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">
                      Data da Consulta
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {data.data || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-500 shadow-2xs">
                    <ClockIcon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">
                      Horário Previsto
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {data.hora || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status do Agendamento */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status do Agendamento
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Situação atualizada no sistema</p>
                </div>
                <StatusChip size="md" tone={getStatusTone(data.status)}>
                  {getStatusLabel(data.status)}
                </StatusChip>
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-end">
              <Button
                className="font-medium text-xs text-slate-700 dark:text-zinc-300"
                radius="lg"
                variant="bordered"
                onPress={close}
              >
                Fechar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
