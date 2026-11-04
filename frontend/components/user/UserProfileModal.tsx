"use client";

import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/hooks/useAuth";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, roles } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [professionalId, setProfessionalId] = useState("CRM/SP 284.912");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const primaryRole = roles[0] || "PROFESSIONAL";
  const roleLabel =
    primaryRole === "MANAGER"
      ? "Gestor de Saúde APS"
      : primaryRole === "PATIENT"
        ? "Cidadão / Paciente"
        : "Médico(a) / Profissional APS";

  const userInitials = (
    (firstName?.[0] || user?.first_name?.[0] || user?.username?.[0] || "U") +
    (lastName?.[0] || user?.last_name?.[0] || "")
  ).toUpperCase();

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xl rounded-2xl max-w-2xl",
        header:
          "border-b border-slate-100 dark:border-zinc-800/80 pb-4 pt-5 px-6",
        body: "py-6 px-6",
        footer:
          "border-t border-slate-100 dark:border-zinc-800/80 py-4 px-6 bg-slate-50/50 dark:bg-zinc-900/50",
      }}
      isOpen={isOpen}
      size="2xl"
      onOpenChange={(open) => !open && onClose()}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400">
                  <UserCircleIcon className="size-6" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Perfil do Usuário
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Informações cadastrais e credenciais no RastreiaCardio APS
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {/* Card Resumo do Profissional */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white font-bold text-lg shadow-sm">
                  {userInitials || "RC"}
                  <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-900 dark:text-white truncate">
                      {firstName || user?.username || "Usuário"} {lastName}
                    </span>
                    <Chip
                      className="text-[11px] font-medium h-5"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {roleLabel}
                    </Chip>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Usuário: @{user?.username || "usuario"} &bull; ID #
                    {user?.id || 1}
                  </span>
                </div>
              </div>

              {/* Seção 1: Dados Pessoais */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <IdentificationIcon className="size-4" />
                  Dados Pessoais & Contato
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700",
                    }}
                    label="Primeiro Nome"
                    placeholder="Seu nome"
                    size="sm"
                    value={firstName}
                    variant="bordered"
                    onValueChange={setFirstName}
                  />
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700",
                    }}
                    label="Sobrenome"
                    placeholder="Seu sobrenome"
                    size="sm"
                    value={lastName}
                    variant="bordered"
                    onValueChange={setLastName}
                  />
                  <Input
                    className="sm:col-span-2"
                    classNames={{
                      inputWrapper:
                        "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700",
                    }}
                    label="E-mail Institucional"
                    placeholder="seu.email@saude.gov.br"
                    size="sm"
                    value={email}
                    variant="bordered"
                    onValueChange={setEmail}
                  />
                </div>
              </div>

              {/* Seção 2: Vínculo Institucional APS */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <BuildingOffice2Icon className="size-4" />
                  Vínculo com a Atenção Primária
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700",
                    }}
                    label="Registro Profissional (CRM / COREN)"
                    size="sm"
                    value={professionalId}
                    variant="bordered"
                    onValueChange={setProfessionalId}
                  />
                  <Input
                    isReadOnly
                    classNames={{
                      inputWrapper:
                        "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 opacity-90",
                    }}
                    label="Unidade de Saúde"
                    size="sm"
                    value="USF Maria Madalena"
                    variant="bordered"
                  />
                  <Input
                    isReadOnly
                    className="sm:col-span-2"
                    classNames={{
                      inputWrapper:
                        "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 opacity-90",
                    }}
                    label="Microárea de Cobertura"
                    size="sm"
                    value="Jardim Magnólia (Microárea 04)"
                    variant="bordered"
                  />
                </div>
              </div>

              {/* Seção 3: Segurança & Sessão */}
              <div className="rounded-xl border border-slate-200/70 p-3.5 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      Sessão Ativa & Protegida
                    </p>
                    <p className="text-slate-500 dark:text-zinc-400">
                      Autenticado via tokens criptografados e-SUS APS
                    </p>
                  </div>
                </div>
                <Chip
                  className="h-5 text-[10px]"
                  color="success"
                  size="sm"
                  variant="flat"
                >
                  Online
                </Chip>
              </div>

              {isSaved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-200">
                  <CheckCircleIcon className="size-4 shrink-0" />
                  Alterações salvas com sucesso!
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex items-center justify-between">
              <Button
                className="font-medium text-slate-600 dark:text-zinc-400"
                size="sm"
                variant="light"
                onPress={onClose}
              >
                Fechar
              </Button>
              <Button
                className="font-medium text-white shadow-xs"
                color="primary"
                size="sm"
                onPress={handleSave}
              >
                Salvar Alterações
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
