"use client";

import {
  BellAlertIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  EyeSlashIcon,
  MoonIcon,
  PaintBrushIcon,
  SpeakerWaveIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { useState } from "react";

import {
  SystemSettings,
  useSystemSettings,
} from "@/lib/hooks/useSystemSettings";
import { notifySuccess } from "@/components/ui/notify";
import { cn } from "@/lib/utils";

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemSettingsModal({
  isOpen,
  onClose,
}: SystemSettingsModalProps) {
  const { setTheme } = useTheme();
  const { settings, updateSettings } = useSystemSettings();

  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Sincroniza quando o modal abre
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalSettings(settings);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
    if (localSettings.theme !== "system") {
      setTheme(localSettings.theme);
    }
    setIsSaved(true);
    notifySuccess(
      "Preferências salvas!",
      "As configurações da interface e alertas foram atualizadas.",
    );
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setLocalSettings((prev) => ({ ...prev, theme: newTheme }));
    if (newTheme !== "system") {
      setTheme(newTheme);
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xl rounded-2xl max-w-2xl",
        header:
          "border-b border-slate-100 dark:border-zinc-800/80 pb-4 pt-5 px-6",
        body: "py-6 px-6 max-h-[80vh] overflow-y-auto",
        footer:
          "border-t border-slate-100 dark:border-zinc-800/80 py-4 px-6 bg-slate-50/50 dark:bg-zinc-900/50",
      }}
      isOpen={isOpen}
      size="2xl"
      onOpenChange={handleOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400">
                  <Cog6ToothIcon className="size-6" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Configurações do Sistema
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Preferências da interface, alertas clínicos e parâmetros da
                    APS
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {/* Seção 1: Aparência & Tema */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <PaintBrushIcon className="size-4" />
                  Tema & Aparência da Interface
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {/* Tema Claro */}
                  <button
                    className={cn(
                      "flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all",
                      localSettings.theme === "light"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/40 font-semibold"
                        : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-300",
                    )}
                    type="button"
                    onClick={() => handleThemeChange("light")}
                  >
                    <SunIcon className="size-5" strokeWidth={2} />
                    <span className="text-xs">Modo Claro</span>
                  </button>

                  {/* Tema Escuro */}
                  <button
                    className={cn(
                      "flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all",
                      localSettings.theme === "dark"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/40 font-semibold"
                        : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-300",
                    )}
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <MoonIcon className="size-5" strokeWidth={2} />
                    <span className="text-xs">Modo Escuro</span>
                  </button>

                  {/* Tema Automático */}
                  <button
                    className={cn(
                      "flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all",
                      localSettings.theme === "system"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/40 font-semibold"
                        : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-300",
                    )}
                    type="button"
                    onClick={() => handleThemeChange("system")}
                  >
                    <ComputerDesktopIcon className="size-5" strokeWidth={2} />
                    <span className="text-xs">Sistema</span>
                  </button>
                </div>
              </div>

              {/* Seção 2: Alertas & Notificações Clínicas */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <BellAlertIcon className="size-4" />
                  Alertas Clínicos & Monitoramento
                </h3>

                <div className="space-y-3 rounded-xl border border-slate-200/70 p-4 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <SpeakerWaveIcon className="size-5 text-slate-500 dark:text-zinc-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          Sons para Alertas Críticos
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Tocar sinal sonoro discreto ao surgir paciente de Alto
                          Risco
                        </p>
                      </div>
                    </div>
                    <Switch
                      color="primary"
                      isSelected={localSettings.audioAlerts}
                      size="sm"
                      onValueChange={(val) =>
                        setLocalSettings((p) => ({ ...p, audioAlerts: val }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="relative size-5 flex items-center justify-center">
                        <span className="size-2.5 rounded-full bg-rose-500 animate-ping absolute" />
                        <span className="size-2 rounded-full bg-rose-500 relative" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          Sinalizador Visual Pulsante
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Exibir efeito pulsante no cabeçalho de alertas
                          urgentes
                        </p>
                      </div>
                    </div>
                    <Switch
                      color="primary"
                      isSelected={localSettings.pulsingAlerts}
                      size="sm"
                      onValueChange={(val) =>
                        setLocalSettings((p) => ({ ...p, pulsingAlerts: val }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Parâmetros da Unidade & APS */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <Cog6ToothIcon className="size-4" />
                  Parâmetros da Atenção Primária
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    classNames={{
                      trigger:
                        "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700",
                    }}
                    label="Unidade de Saúde Padrão"
                    selectedKeys={[localSettings.defaultUbs]}
                    size="sm"
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      if (selected) {
                        setLocalSettings((p) => ({
                          ...p,
                          defaultUbs: selected,
                        }));
                      }
                    }}
                  >
                    <SelectItem key="USF Maria Madalena">
                      USF Maria Madalena
                    </SelectItem>
                    <SelectItem key="UBS Centro">UBS Centro</SelectItem>
                    <SelectItem key="USF Jardim das Flores">
                      USF Jardim das Flores
                    </SelectItem>
                  </Select>

                  <Select
                    classNames={{
                      trigger:
                        "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700",
                    }}
                    label="Itens por Página na Agenda"
                    selectedKeys={[String(localSettings.pageSize)]}
                    size="sm"
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      if (selected) {
                        setLocalSettings((p) => ({
                          ...p,
                          pageSize: Number(selected),
                        }));
                      }
                    }}
                  >
                    <SelectItem key="8">8 registros (Padrão)</SelectItem>
                    <SelectItem key="15">15 registros</SelectItem>
                    <SelectItem key="25">25 registros</SelectItem>
                  </Select>
                </div>
              </div>

              {/* Seção 4: Privacidade & LGPD */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <EyeSlashIcon className="size-4" />
                  Privacidade & Dados (LGPD)
                </h3>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 p-4 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/20">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      Ocultar Dígitos Centrais do CPF
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Exibir CPF com máscara de proteção nas listagens clínicas
                    </p>
                  </div>
                  <Switch
                    color="primary"
                    isSelected={localSettings.maskCpf}
                    size="sm"
                    onValueChange={(val) =>
                      setLocalSettings((p) => ({ ...p, maskCpf: val }))
                    }
                  />
                </div>
              </div>

              {isSaved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-200">
                  <CheckCircleIcon className="size-4 shrink-0" />
                  Preferências salvas com sucesso!
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
                Cancelar
              </Button>
              <Button
                className="font-medium text-white shadow-xs"
                color="primary"
                size="sm"
                onPress={handleSave}
              >
                Salvar Preferências
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
