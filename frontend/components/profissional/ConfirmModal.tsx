"use client";

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Confirmar ação",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      backdrop="blur"
      isOpen={open}
      placement="center"
      size="sm"
      onOpenChange={(o) => !o && onCancel()}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">{title}</ModalHeader>

        <ModalBody>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </ModalBody>

        <ModalFooter>
          <Button radius="lg" variant="light" onPress={onCancel}>
            {cancelText}
          </Button>

          <Button
            color={tone === "danger" ? "danger" : "primary"}
            radius="lg"
            onPress={onConfirm}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
