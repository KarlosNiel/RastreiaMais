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
import {
  BellAlertIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import { useCreateAlert } from "@/lib/hooks/alerts/useCreateAlert";
import { useDeleteAlert } from "@/lib/hooks/alerts/useDeleteAlert";
import { notifyError, notifySuccess } from "@/components/ui/notify";

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
  const [risk, setRisk] = useState<"safe" | "moderate" | "critical">("moderate");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();

  useEffect(() => {
    setSubmitted(false);
    setErrorMessage(null);

    if (alertData) {
      setCpf(alertData.patient?.cpf || alertData.cpf || "");
      setRisk(alertData.risk_level || "moderate");
      setTitle(alertData.title || "");
      setDescription(alertData.description || "");
    } else {
      setCpf("");
      setRisk("moderate");
      setTitle("");
      setDescription("");
    }
  }, [alertData, open]);

  const handleSave = async () => {
    setSubmitted(true);
    setErrorMessage(null);

    const cleanCpf = cpf.replace(/\D/g, "");

    if (!cleanCpf) {
      setErrorMessage("Por favor, informe o CPF do paciente.");
      notifyError("CPF obrigatório", "Informe o CPF para associar o alerta ao paciente.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Informe o título do alerta.");
      notifyError("Título obrigatório", "Dê um título resumido ao alerta.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Informe o motivo ou conduta do alerta.");
      notifyError("Descrição obrigatória", "Descreva o motivo do alerta clínico.");
      return;
    }

    const payload = {
      cpf: cleanCpf,
      risk_level: risk || "moderate",
      title: title.trim(),
      description: description.trim(),
    };

    try {
      await createAlert.mutateAsync(payload);
      notifySuccess("Alerta criado com sucesso!", "O alerta clínico foi registrado para a equipe de saúde.");
      onOpenChange(false);
    } catch (err: any) {
      const data = err?.response?.data;
      let msg = "Não foi possível registrar o alerta.";

      if (data?.cpf) {
        msg = Array.isArray(data.cpf) ? data.cpf[0] : String(data.cpf);
      } else if (data?.detail) {
        msg = String(data.detail);
      } else if (err?.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
      notifyError("Erro ao registrar alerta", msg);
    }
  };

  const handleDelete = async () => {
    if (!alertData?.id) return;

    try {
      await deleteAlert.mutateAsync(Number(alertData.id));
      notifySuccess("Alerta excluído com sucesso.");
      setConfirmDeleteOpen(false);
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Não foi possível excluir o alerta.";
      notifyError("Erro ao excluir", msg);
    }
  };

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
        }}
        isOpen={open}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2.5 pb-2 pt-6 px-6">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <BellAlertIcon className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {alertData ? "Detalhes do Alerta" : "Criar Novo Alerta Clínico"}
                  </h2>
                  <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                    Notifique a equipe de saúde sobre riscos ou queixas prioritárias
                  </p>
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4 pt-3 pb-6 px-6">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-2xs">
                    <ExclamationCircleIcon className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <div className="flex-1">
                      <span className="font-semibold block">Atenção ao salvar:</span>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

                <Input
                  isRequired
                  errorMessage={submitted && !cpf ? "Informe o CPF do paciente" : ""}
                  isDisabled={!!alertData}
                  isInvalid={submitted && !cpf}
                  label="CPF do Paciente *"
                  placeholder="Ex: 111.444.777-35"
                  radius="lg"
                  value={cpf}
                  variant="bordered"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setCpf(raw);
                    setErrorMessage(null);
                  }}
                />

                <Select
                  isRequired
                  isDisabled={!!alertData}
                  label="Nível de Risco *"
                  radius="lg"
                  selectedKeys={[risk]}
                  variant="bordered"
                  onChange={(e) => setRisk((e.target.value as any) || "moderate")}
                >
                  <SelectItem key="safe">Seguro (Baixo Risco)</SelectItem>
                  <SelectItem key="moderate">Moderado (Acompanhamento)</SelectItem>
                  <SelectItem key="critical">Crítico (Atenção Imediata)</SelectItem>
                </Select>

                <Input
                  isRequired
                  errorMessage={submitted && !title.trim() ? "Informe o título do alerta" : ""}
                  isDisabled={!!alertData}
                  isInvalid={submitted && !title.trim()}
                  label="Título do Alerta *"
                  placeholder="Ex: Pressão Arterial acima de 180 mmHg"
                  radius="lg"
                  value={title}
                  variant="bordered"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrorMessage(null);
                  }}
                />

                <Textarea
                  isRequired
                  errorMessage={submitted && !description.trim() ? "Informe a descrição do alerta" : ""}
                  isDisabled={!!alertData}
                  isInvalid={submitted && !description.trim()}
                  label="Descrição / Conduta Sugerida *"
                  minRows={3}
                  placeholder="Descreva o motivo do alerta clínico e orientações prévias..."
                  radius="lg"
                  value={description}
                  variant="bordered"
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrorMessage(null);
                  }}
                />
              </ModalBody>

              {alertData ? (
                <ModalFooter className="px-6 pb-6 pt-2">
                  <Button
                    className="font-medium text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                    isLoading={deleteAlert.isPending}
                    radius="lg"
                    onPress={() => setConfirmDeleteOpen(true)}
                  >
                    Excluir Alerta
                  </Button>

                  <Button
                    className="font-medium text-xs text-slate-700 dark:text-zinc-300"
                    radius="lg"
                    variant="light"
                    onPress={onClose}
                  >
                    Fechar
                  </Button>
                </ModalFooter>
              ) : (
                <ModalFooter className="px-6 pb-6 pt-2">
                  <Button
                    className="font-medium text-xs text-slate-700 dark:text-zinc-300"
                    radius="lg"
                    variant="light"
                    onPress={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="font-semibold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
                    isLoading={createAlert.isPending}
                    radius="lg"
                    onPress={handleSave}
                  >
                    Salvar Alerta
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        classNames={{
          base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
        }}
        isOpen={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-rose-600 font-bold text-base px-6 pt-6 pb-2">
                Confirmar Exclusão de Alerta
              </ModalHeader>

              <ModalBody className="text-sm text-slate-600 dark:text-zinc-400 px-6 py-2">
                Tem certeza que deseja excluir este alerta clínico? O histórico de monitoramento deste alerta será removido.
              </ModalBody>

              <ModalFooter className="px-6 pb-6 pt-4">
                <Button
                  className="font-medium text-xs text-slate-700 dark:text-zinc-300"
                  radius="lg"
                  variant="light"
                  onPress={onClose}
                >
                  Cancelar
                </Button>

                <Button
                  className="font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white"
                  isLoading={deleteAlert.isPending}
                  radius="lg"
                  onPress={handleDelete}
                >
                  Excluir Alerta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
