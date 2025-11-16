"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { CalendarIcon, UserIcon, MapPinIcon, ClockIcon, HeartIcon } from "@heroicons/react/24/outline";
import { AgendaRow } from "./AgendaTable";
import { StatusChip } from "@/components/ui/StatusChip";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: AgendaRow | null;
}

export default function ProfessionalAppointmentDetailsModal({
  open,
  onClose,
  data,
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
        return "Crítico";
      case "moderate":
        return "Atenção";
      default:
        return "Seguro";
    }
  };

  return (
    <Modal 
      isOpen={open} 
      onOpenChange={onClose} 
      backdrop="blur"
      size="lg"
      classNames={{
        base: "dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-800",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-800",
      }}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Detalhes do Agendamento</h2>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Informações completas da consulta
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-5">
              {/* Paciente */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                  <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Paciente
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {data.paciente}
                  </p>
                  {data.docMasked && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Doc: {data.docMasked}
                    </p>
                  )}
                </div>
              </div>

              {/* Condição */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                  <HeartIcon className="h-5 w-5 text-gray-600 dark:text-gray-400"/>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Condição de Saúde
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {data.condicao}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Local */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                    <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Local
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {data.local}
                    </p>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                    <ClockIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Horário
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                      {data.hora}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status e Risco */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Status
                  </p>
                  <StatusChip
                    size="md"
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

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Nível de Risco
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      data.risco === "critical"
                        ? "bg-rose-500"
                        : data.risco === "moderate"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`} />
                    <span className={`font-semibold ${getRiskColor(data.risco)}`}>
                      {getRiskLabel(data.risco)}
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button 
                color="primary" 
                variant="light" 
                onPress={close}
                className="font-medium"
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