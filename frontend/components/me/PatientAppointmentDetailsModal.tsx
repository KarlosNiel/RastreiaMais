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
  ClockIcon
} from "@heroicons/react/24/outline";
import { StatusChip } from "@/components/ui/StatusChip";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: any;
}

export default function PatientAppointmentDetailsModal({ open, onClose, data }: Props) {
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
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <ClipboardDocumentListIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Detalhes da Consulta</h2>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Informações do agendamento
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-5">
              {/* Profissional */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                  <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Profissional
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {data.profissional || "—"}
                  </p>
                </div>
              </div>

              {/* Cargo */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                  <BriefcaseIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Cargo
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {data.cargo || "—"}
                  </p>
                </div>
              </div>

              {/* Local */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                  <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Local de Atendimento
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {data.local || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Data */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                    <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Data
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {data.data || "—"}
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
                      {data.hora || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Status da Consulta
                </p>
                <StatusChip
                  size="md"
                  tone={getStatusTone(data.status)}
                >
                  {getStatusLabel(data.status)}
                </StatusChip>
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
}'x'