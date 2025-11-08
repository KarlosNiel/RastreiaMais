"use client";

import { useState } from "react";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAlertModal({ open, onOpenChange }: Props) {
  const [cpf, setCpf] = useState("");
  const [risk, setRisk] = useState<"safe" | "moderate" | "critical" | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createAlert = useCreateAlert();

  const handleSave = async () => {
    if (!cpf || !title || !description) {
      console.warn("⚠️ Campos obrigatórios faltando:", { cpf, title, description });
      return;
    }

    const payload = {
      cpf,
      risk_level: risk || "safe",
      title,
      description,
    };

    console.log("📤 Enviando payload:", payload);

    try {
      await createAlert.mutateAsync(payload);
      onOpenChange(false);
      setCpf("");
      setRisk("");
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("❌ Erro ao criar alerta:", err);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Criar novo alerta</ModalHeader>

            <ModalBody className="space-y-3">
              <Input
                label="CPF"
                placeholder="Ex: 123.456.789-00"
                variant="bordered"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />

              <Select
                label="Nível de Risco"
                selectedKeys={risk ? [risk] : []}
                onChange={(e) => setRisk(e.target.value as any)}
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
              />

              <Textarea
                label="Descrição"
                placeholder="Descreva o motivo do alerta..."
                variant="bordered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </ModalBody>

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
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
