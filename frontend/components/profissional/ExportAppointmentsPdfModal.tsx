"use client";

import type {
  AgendaRow,
  RiskTone,
} from "@/components/profissional/AgendaTable";

import {
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_EXPORT_PDF_OPTIONS,
  type ExportPdfOptions,
  type PdfOrientation,
  type PdfPeriodPreset,
  type PdfSortOption,
  buildExportScopeLabel,
  filterAndSortAppointmentsForExport,
  summarizeAppointments,
  toLocalDateKey,
} from "@/lib/pdf/appointmentsPdfFilters";
import { cn } from "@/lib/utils";

interface ExportAppointmentsPdfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allRows: AgendaRow[];
  currentViewRows: AgendaRow[];
  currentViewSummary?: string;
  initialPeriod?: PdfPeriodPreset;
  isExporting?: boolean;
  onExport: (
    options: ExportPdfOptions,
    scopeLabel: string,
  ) => Promise<void> | void;
}

const PERIOD_OPTIONS: Array<{
  id: PdfPeriodPreset;
  label: string;
}> = [
  { id: "current", label: "Visualização atual" },
  { id: "all", label: "Todos" },
  { id: "today", label: "Hoje" },
  { id: "next7days", label: "Próximos 7 dias" },
  { id: "thisMonth", label: "Este mês" },
  { id: "custom", label: "Período personalizado" },
];

const SORT_OPTIONS: Array<{ key: PdfSortOption; label: string }> = [
  { key: "date-asc", label: "Data e horário (crescente)" },
  { key: "date-desc", label: "Data e horário (decrescente)" },
  { key: "patient-asc", label: "Nome do paciente (A–Z)" },
  { key: "risk-desc", label: "Maior risco clínico primeiro" },
];

export default function ExportAppointmentsPdfModal({
  open,
  onOpenChange,
  allRows,
  currentViewRows,
  currentViewSummary,
  initialPeriod = "current",
  isExporting = false,
  onExport,
}: ExportAppointmentsPdfModalProps) {
  const [options, setOptions] = useState<ExportPdfOptions>(() => ({
    ...DEFAULT_EXPORT_PDF_OPTIONS,
    period: initialPeriod,
  }));

  useEffect(() => {
    if (!open) return;

    const todayKey = toLocalDateKey(new Date());
    const nextWeek = new Date();

    nextWeek.setDate(nextWeek.getDate() + 6);
    const nextWeekKey = toLocalDateKey(nextWeek);

    setOptions((prev) => ({
      ...prev,
      period: initialPeriod,
      startDate: prev.startDate || todayKey,
      endDate: prev.endDate || nextWeekKey,
    }));
  }, [open, initialPeriod]);

  const matchingRows = useMemo(
    () => filterAndSortAppointmentsForExport(allRows, currentViewRows, options),
    [allRows, currentViewRows, options],
  );

  const summary = useMemo(
    () => summarizeAppointments(matchingRows),
    [matchingRows],
  );

  const scopeLabel = useMemo(
    () => buildExportScopeLabel(options, currentViewSummary),
    [options, currentViewSummary],
  );

  const handlePeriodChange = (period: PdfPeriodPreset) => {
    setOptions((prev) => ({ ...prev, period }));
  };

  const handleOrientationChange = (orientation: PdfOrientation) => {
    setOptions((prev) => ({ ...prev, orientation }));
  };

  const handleSubmit = async () => {
    if (matchingRows.length === 0 || isExporting) return;
    await onExport(options, scopeLabel);
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
        header:
          "border-b border-slate-100 dark:border-zinc-800/80 pb-4 pt-5 px-6",
        body: "py-5 px-6 space-y-5",
        footer:
          "border-t border-slate-100 dark:border-zinc-800/80 py-4 px-6 bg-slate-50/50 dark:bg-zinc-900/50",
      }}
      isOpen={open}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400">
                <DocumentArrowDownIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Exportar Agendamentos em PDF
                </h2>
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                  Selecione o período, os filtros clínicos e o formato do
                  relatório
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              {/* Seção 1: Escopo / Período */}
              <div className="space-y-2.5">
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                  id="pdf-period-label"
                >
                  Período / Escopo dos Dados
                </p>

                <div
                  aria-labelledby="pdf-period-label"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                  role="group"
                >
                  {PERIOD_OPTIONS.map((opt) => {
                    const selected = options.period === opt.id;

                    return (
                      <button
                        key={opt.id}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-left",
                          selected
                            ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold shadow-2xs"
                            : "border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800",
                        )}
                        type="button"
                        onClick={() => handlePeriodChange(opt.id)}
                      >
                        <span className="truncate">{opt.label}</span>
                        {opt.id === "current" && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums shrink-0",
                              selected
                                ? "bg-primary/15 text-primary"
                                : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300",
                            )}
                          >
                            {currentViewRows.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {options.period === "current" && (
                  <div className="flex items-start gap-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/40 px-3.5 py-2.5 text-xs text-slate-600 dark:text-zinc-300">
                    <CalendarDaysIcon className="size-4 shrink-0 mt-0.5 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-zinc-100">
                        Filtros ativos da agenda:{" "}
                      </span>
                      <span>
                        {currentViewSummary || "Todos os agendamentos"}
                      </span>
                    </div>
                  </div>
                )}

                {options.period === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Input
                      label="Data inicial"
                      radius="lg"
                      size="sm"
                      type="date"
                      value={options.startDate}
                      variant="bordered"
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                    <Input
                      label="Data final"
                      radius="lg"
                      size="sm"
                      type="date"
                      value={options.endDate}
                      variant="bordered"
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Seção 2: Filtros clínicos (quando não usa visualização atual) */}
              {options.period !== "current" && (
                <div className="space-y-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckboxGroup
                      classNames={{
                        label:
                          "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400",
                      }}
                      color="primary"
                      label="Status do Agendamento"
                      size="sm"
                      value={options.statuses}
                      onValueChange={(vals) =>
                        setOptions((prev) => ({ ...prev, statuses: vals }))
                      }
                    >
                      <Checkbox value="ativo">Ativo</Checkbox>
                      <Checkbox value="finalizado">Finalizado</Checkbox>
                      <Checkbox value="cancelado">Cancelado</Checkbox>
                    </CheckboxGroup>

                    <CheckboxGroup
                      classNames={{
                        label:
                          "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400",
                      }}
                      color="primary"
                      label="Nível de Risco"
                      size="sm"
                      value={options.risks}
                      onValueChange={(vals) =>
                        setOptions((prev) => ({
                          ...prev,
                          risks: vals as RiskTone[],
                        }))
                      }
                    >
                      <Checkbox value="safe">Baixo risco</Checkbox>
                      <Checkbox value="moderate">Risco moderado</Checkbox>
                      <Checkbox value="critical">Alto risco</Checkbox>
                    </CheckboxGroup>
                  </div>

                  <Select
                    label="Ordenação no PDF"
                    radius="lg"
                    selectedKeys={[options.sortBy]}
                    size="sm"
                    variant="bordered"
                    onChange={(e) => {
                      if (e.target.value) {
                        setOptions((prev) => ({
                          ...prev,
                          sortBy: e.target.value as PdfSortOption,
                        }));
                      }
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}

              {/* Seção 3: Layout e Campos do PDF */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Layout e Campos do Documento
                </p>

                <div className="grid grid-cols-2 gap-2" role="group">
                  <button
                    aria-pressed={options.orientation === "landscape"}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-left",
                      options.orientation === "landscape"
                        ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                        : "border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 hover:bg-slate-50",
                    )}
                    type="button"
                    onClick={() => handleOrientationChange("landscape")}
                  >
                    <span className="block">Paisagem (A4)</span>
                    <span className="block text-[10px] font-normal opacity-80">
                      Ideal para tabelas completas
                    </span>
                  </button>

                  <button
                    aria-pressed={options.orientation === "portrait"}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-left",
                      options.orientation === "portrait"
                        ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                        : "border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 hover:bg-slate-50",
                    )}
                    type="button"
                    onClick={() => handleOrientationChange("portrait")}
                  >
                    <span className="block">Retrato (A4)</span>
                    <span className="block text-[10px] font-normal opacity-80">
                      Formato vertical compacto
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <Checkbox
                    color="primary"
                    isSelected={options.includeContact}
                    size="sm"
                    onValueChange={(v) =>
                      setOptions((prev) => ({ ...prev, includeContact: v }))
                    }
                  >
                    Incluir CPF, telefone e CNS
                  </Checkbox>

                  <Checkbox
                    color="primary"
                    isSelected={options.includeProfessional}
                    size="sm"
                    onValueChange={(v) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeProfessional: v,
                      }))
                    }
                  >
                    Incluir profissional responsável
                  </Checkbox>

                  <Checkbox
                    color="primary"
                    isSelected={options.includeNotes}
                    size="sm"
                    onValueChange={(v) =>
                      setOptions((prev) => ({ ...prev, includeNotes: v }))
                    }
                  >
                    Incluir observações clínicas
                  </Checkbox>

                  <Checkbox
                    color="primary"
                    isSelected={options.includeSignatureArea}
                    size="sm"
                    onValueChange={(v) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeSignatureArea: v,
                      }))
                    }
                  >
                    Incluir área para assinatura
                  </Checkbox>
                </div>
              </div>

              {/* Resumo dinâmico antes de baixar */}
              {matchingRows.length === 0 ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                  <ExclamationTriangleIcon className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Nenhum agendamento encontrado com os critérios acima.
                    </p>
                    <p className="mt-0.5 opacity-90">
                      Altere o período ou marque outros filtros de status/risco
                      para gerar o PDF.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-4 py-3 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {summary.total}{" "}
                    {summary.total === 1
                      ? "agendamento selecionado"
                      : "agendamentos selecionados"}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-zinc-400 tabular-nums">
                    <span>Ativos: {summary.active}</span>
                    <span>•</span>
                    <span>Alto risco: {summary.critical}</span>
                    <span>•</span>
                    <span>Finalizados: {summary.finalized}</span>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex items-center justify-between gap-2">
              <Button
                className="font-medium text-xs text-slate-700 dark:text-zinc-300"
                isDisabled={isExporting}
                radius="md"
                size="sm"
                variant="light"
                onPress={close}
              >
                Cancelar
              </Button>

              <Button
                className="font-semibold text-xs text-white shadow-2xs"
                color="primary"
                isDisabled={matchingRows.length === 0}
                isLoading={isExporting}
                radius="md"
                size="sm"
                startContent={
                  !isExporting ? (
                    <DocumentArrowDownIcon className="size-4" />
                  ) : undefined
                }
                variant="solid"
                onPress={handleSubmit}
              >
                Baixar PDF
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
