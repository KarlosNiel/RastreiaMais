"use client";

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
  isLoading?: boolean;
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
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isDanger = tone === "danger";

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-1",
        header: "pb-2 pt-5 px-5",
        body: "py-2 px-5",
        footer: "pt-4 pb-5 px-5",
      }}
      isOpen={open}
      placement="center"
      size="sm"
      onOpenChange={(o) => {
        if (!o && !isLoading) onCancel();
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isDanger
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400"
            }`}
          >
            {isDanger ? (
              <ExclamationTriangleIcon className="size-5" />
            ) : (
              <InformationCircleIcon className="size-5" />
            )}
          </div>
          <span className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            {title}
          </span>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            {message}
          </p>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-2.5">
          <Button
            className="font-medium text-slate-700 dark:text-zinc-300"
            isDisabled={isLoading}
            radius="md"
            variant="flat"
            onPress={onCancel}
          >
            {cancelText}
          </Button>

          <Button
            className="font-medium shadow-xs"
            color={isDanger ? "danger" : "primary"}
            isLoading={isLoading}
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
