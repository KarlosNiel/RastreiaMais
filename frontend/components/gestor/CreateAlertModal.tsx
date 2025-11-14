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

interface AlertData {
  patient: any;
  cpf?: string;
  risk_level?: "safe" | "moderate" | "critical";
  title?: string;
  description?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertData?: AlertData | null; // 👈 Novo
}

export default function CreateAlertModal({ open, onOpenChange, alertData }: Props) {
  const [cpf, setCpf] = useState("");
  const [risk, setRisk] = useState<"safe" | "moderate" | "critical" | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const createAlert = useCreateAlert();

  // 🔄 Quando abrir o modal com dados de alerta, preencher os campos
  useEffect(() => {
    if (alertData) {
      setCpf(alertData.patient?.cpf || "");
      setRisk(alertData.risk_level || "");
      setTitle(alertData.title || "");
      setDescription(alertData.description || "");
    } else {
      // se for criação, limpa tudo
      setCpf("");
      setRisk("");
      setTitle("");
      setDescription("");
    }
  }, [alertData, open]);

  const handleSave = async () => {
    if (!cpf.trim() || !title || !description) {
      console.warn("⚠️ Campos obrigatórios faltando:", { cpf, title, description });
      return;
    }

    const payload = {
      cpf: /^\d+$/.test(cpf) ? cpf : cpf.trim(),
      risk_level: risk || "safe",
      title,
      description,
    };

    console.log("📤 Enviando payload:", payload);

    try {
      await createAlert.mutateAsync(payload);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Erro ao criar alerta:", err);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {alertData ? "Detalhes do alerta" : "Criar novo alerta"}
            </ModalHeader>

            <ModalBody className="space-y-3">
              <Input
                label="CPF"
                placeholder="Ex: 12345678900"
                variant="bordered"
                value={cpf}
                onChange={(e) => {
                  const value = e.target.value;
                  // Se for só letras (por extenso), aceita direto
                  if (/^[A-Za-z\s]+$/.test(value)) {
                    setCpf(value);
                  } 
                  // Se for números, aceita apenas até 11 dígitos, sem formatar
                  else if (/^\d*$/.test(value)) {
                    setCpf(value.slice(0, 11));
                  }
                }}
                isDisabled={!!alertData} // desativa se estiver visualizando
              />

              <Select
                label="Nível de Risco"
                selectedKeys={risk ? [risk] : []}
                onChange={(e) => setRisk(e.target.value as any)}
                isDisabled={!!alertData}
              >
                <SelectItem key="safe">Seguro</SelectItem>
                <SelectItem key="moderate">Moderado</SelectItem>
                <SelectItem key="critical">Crítico</SelectItem>
              </Select>

              <Input
                label="Título"
                placeholder="Ex: Falta de retorno da consulta"
                variant="bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                isDisabled={!!alertData}
              />

              <Textarea
                label="Descrição"
                placeholder="Descreva o motivo do alerta..."
                variant="bordered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isDisabled={!!alertData}
              />
            </ModalBody>

            {!alertData && (
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isLoading={createAlert.isPending}
                >
                  Salvar
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
