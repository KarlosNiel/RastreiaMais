"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
} from "@heroui/react";

import { useCreateAlert } from "@/lib/hooks/alerts/useCreateAlert";
import { useDeleteAlert } from "@/lib/hooks/alerts/useDeleteAlert";

interface AlertData {
  id?: number | string;
  patient: any;
  cpf?: string;
  risk_level?: "safe" | "moderate" | "critical";
  title?: string;
  description?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertData?: AlertData | null;
}

export default function CreateAlertModal({
  open,
  onOpenChange,
  alertData,
}: Props) {
  const [cpf, setCpf] = useState("");
  const [risk, setRisk] = useState<"safe" | "moderate" | "critical" | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();

  useEffect(() => {
    if (alertData) {
      setCpf(alertData.patient?.cpf || "");
      setRisk(alertData.risk_level || "");
      setTitle(alertData.title || "");
      setDescription(alertData.description || "");
    } else {
      setCpf("");
      setRisk("");
      setTitle("");
      setDescription("");
    }
  }, [alertData, open]);

  const handleSave = async () => {
    if (!cpf.trim() || !title || !description) return;

    const payload = {
      cpf: /^\d+$/.test(cpf) ? cpf : cpf.trim(),
      risk_level: risk || "safe",
      title,
      description,
    };

    try {
      await createAlert.mutateAsync(payload);
      onOpenChange(false);
    } catch {}
  };

  const handleDelete = async () => {
    if (!alertData?.id) return;

    try {
      await deleteAlert.mutateAsync(Number(alertData.id));
      setConfirmDeleteOpen(false);
      onOpenChange(false);
    } catch {}
  };

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: "rounded-xl shadow-xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
        }}
        isOpen={open}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-semibold text-base">
                {alertData ? "Detalhes do Alerta" : "Criar Novo Alerta"}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Input
                  isDisabled={!!alertData}
                  label="CPF"
                  placeholder="Ex: 12345678900"
                  radius="md"
                  value={cpf}
                  variant="bordered"
                  onChange={(e) => {
                    const value = e.target.value;

                    if (/^[A-Za-z\s]+$/.test(value)) setCpf(value);
                    else if (/^\d*$/.test(value)) setCpf(value.slice(0, 11));
                  }}
                />

                <Select
                  isDisabled={!!alertData}
                  label="Nível de Risco"
                  radius="md"
                  selectedKeys={risk ? [risk] : []}
                  variant="bordered"
                  onChange={(e) => setRisk(e.target.value as any)}
                >
                  <SelectItem key="safe">Seguro</SelectItem>
                  <SelectItem key="moderate">Moderado</SelectItem>
                  <SelectItem key="critical">Crítico</SelectItem>
                </Select>

                <Input
                  isDisabled={!!alertData}
                  label="Título"
                  placeholder="Ex: Falta de retorno da consulta"
                  radius="md"
                  value={title}
                  variant="bordered"
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                  isDisabled={!!alertData}
                  label="Descrição"
                  placeholder="Descreva o motivo do alerta..."
                  radius="md"
                  value={description}
                  variant="bordered"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </ModalBody>

              {alertData ? (
                <ModalFooter>
                  <Button
                    className="font-medium"
                    color="danger"
                    isLoading={deleteAlert.isPending}
                    radius="md"
                    variant="flat"
                    onPress={() => setConfirmDeleteOpen(true)}
                  >
                    Excluir Alerta
                  </Button>

                  <Button
                    className="font-medium text-slate-700 dark:text-zinc-300"
                    radius="md"
                    variant="light"
                    onPress={onClose}
                  >
                    Fechar
                  </Button>
                </ModalFooter>
              ) : (
                <ModalFooter>
                  <Button
                    className="font-medium text-slate-700 dark:text-zinc-300"
                    radius="md"
                    variant="light"
                    onPress={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="font-medium"
                    color="primary"
                    isLoading={createAlert.isPending}
                    radius="md"
                    onPress={handleSave}
                  >
                    Salvar
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        classNames={{
          base: "rounded-xl shadow-xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
        }}
        isOpen={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-danger font-semibold text-base">
                Confirmar Exclusão
              </ModalHeader>

              <ModalBody className="text-sm text-slate-600 dark:text-zinc-400">
                Tem certeza que deseja excluir este alerta? Essa ação não pode
                ser desfeita.
              </ModalBody>

              <ModalFooter>
                <Button
                  className="font-medium text-slate-700 dark:text-zinc-300"
                  radius="md"
                  variant="light"
                  onPress={onClose}
                >
                  Cancelar
                </Button>

                <Button
                  className="font-medium"
                  color="danger"
                  isLoading={deleteAlert.isPending}
                  radius="md"
                  onPress={handleDelete}
                >
                  Excluir
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
