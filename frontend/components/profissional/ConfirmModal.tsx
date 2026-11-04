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
      classNames={{
        base: "rounded-xl shadow-xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
      }}
      isOpen={open}
      placement="center"
      size="sm"
      onOpenChange={(o) => !o && onCancel()}
    >
      <ModalContent>
        <ModalHeader className="text-base font-semibold">{title}</ModalHeader>

        <ModalBody>
          <p className="text-sm text-slate-600 dark:text-zinc-400">{message}</p>
        </ModalBody>

        <ModalFooter>
          <Button
            className="font-medium text-slate-700 dark:text-zinc-300"
            radius="md"
            variant="light"
            onPress={onCancel}
          >
            {cancelText}
          </Button>

          <Button
            className="font-medium"
            color={tone === "danger" ? "danger" : "primary"}
            radius="md"
            onPress={onConfirm}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
