"use client";

import type { ClinicalPatientSummary } from "@/lib/hooks/profissional/useClinicalAnalytics";

import React, { useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Link from "next/link";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Heart,
  ShieldAlert,
  Syringe,
} from "lucide-react";

import CreateAppointmentsModal from "@/components/appointments/CreateAppointmentsModal";
import SOAPReportModal from "@/components/pacientes/SOAPReportModal";
import { generateSOAPReport, type SOAPReport } from "@/lib/api/soap";
import { notifyError } from "@/components/ui/notify";
import { capitalizeWords, formatCpf } from "@/lib/utils";

export type PatientFilterCategory =
  | "all_critical"
  | "bp_e3"
  | "bp_e2"
  | "bp_e1"
  | "bp_pre"
  | "bp_normal"
  | "bp_uncontrolled"
  | "framingham_alto"
  | "framingham_moderado"
  | "dm_altered"
  | "dm_insulin"
  | "comorbidity"
  | "has_only"
  | "dm_only";

interface ClinicalPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PatientFilterCategory;
  onCategoryChange: (category: PatientFilterCategory) => void;
  patients: ClinicalPatientSummary[];
}

const CATEGORY_CONFIG: Record<
  PatientFilterCategory,
  {
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  all_critical: {
    title: "Pacientes Prioritários (Atenção Imediata)",
    subtitle:
      "Pacientes em Estágio 3, Alto Risco Cardiovascular ou Glicemia Descompensada",
    badge: "Ação Prioritária",
    badgeColor:
      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    icon: AlertTriangle,
  },
  bp_e3: {
    title: "Hipertensão Estágio 3 Crítico (≥180/110 mmHg)",
    subtitle:
      "Risco agudo de lesão em órgão-alvo. Requer consulta médica imediata e ajuste medicamentoso",
    badge: "Estágio 3 Crítico 🚨",
    badgeColor:
      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    icon: AlertCircle,
  },
  bp_e2: {
    title: "Hipertensão Estágio 2 (160-179 / 100-109 mmHg)",
    subtitle:
      "Hipertensão moderada fora da meta do SUS. Requer acompanhamento e terapia combinada",
    badge: "Estágio 2",
    badgeColor:
      "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
    icon: Activity,
  },
  bp_e1: {
    title: "Hipertensão Estágio 1 (140-159 / 90-99 mmHg)",
    subtitle:
      "Hipertensão leve fora da meta (<140/90). Avaliar adesão e ajuste terapêutico",
    badge: "Estágio 1",
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    icon: Activity,
  },
  bp_pre: {
    title: "Pacientes Pré-Hipertensos (120-139 / 80-89 mmHg)",
    subtitle:
      "Sob acompanhamento preventivo na APS para evitar progressão diagnóstica",
    badge: "Pré-HAS (Na Meta)",
    badgeColor:
      "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    icon: CheckCircle2,
  },
  bp_normal: {
    title: "Pacientes com PA Normal / Ótima (<120/80 mmHg)",
    subtitle: "Excelente controle pressórico na Atenção Primária",
    badge: "PA Normal (Na Meta)",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  bp_uncontrolled: {
    title: "Pacientes com PA Fora da Meta (≥140/90 mmHg)",
    subtitle:
      "Todos os pacientes hipertensos nos Estágios 1, 2 e 3 que demandam intervenção",
    badge: "Fora da Meta APS",
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    icon: AlertTriangle,
  },
  framingham_alto: {
    title: "Alto Risco Cardiovascular (Framingham > 20%)",
    subtitle:
      "Probabilidade > 20% de infarto ou AVE em 10 anos. Exige meta estrita de PA < 130/80 e estatinas",
    badge: "Alto Risco (>20%)",
    badgeColor:
      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    icon: ShieldAlert,
  },
  framingham_moderado: {
    title: "Risco Cardiovascular Moderado (10% - 20%)",
    subtitle:
      "Acompanhamento semestral e rastreio de lesão subclínica de órgão-alvo",
    badge: "Risco Moderado",
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    icon: ShieldAlert,
  },
  dm_altered: {
    title: "Diabetes com Glicemia Descompensada",
    subtitle:
      "Glicemia de jejum elevada ou HbA1c > 7%. Requer reavaliação de esquema medicamentoso e MEV",
    badge: "Glicemia Alterada",
    badgeColor:
      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    icon: Droplet,
  },
  dm_insulin: {
    title: "Pacientes Diabéticos Insulinodependentes",
    subtitle:
      "Em uso de insulina NPH/Regular. Exigem dispensação contínua de glicosímetro e fitas",
    badge: "Insulinoterapia",
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    icon: Syringe,
  },
  comorbidity: {
    title: "Multimorbidade: Hipertensão + Diabetes",
    subtitle:
      "Pacientes com diagnóstico concomitante de HAS e DM. Risco cardiovascular sinérgico",
    badge: "HAS + Diabetes",
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    icon: Heart,
  },
  has_only: {
    title: "Pacientes com Apenas Hipertensão",
    subtitle: "Diagnóstico confirmado de HAS isolada",
    badge: "Apenas HAS",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    icon: Heart,
  },
  dm_only: {
    title: "Pacientes com Apenas Diabetes",
    subtitle: "Diagnóstico confirmado de DM isolado",
    badge: "Apenas DM",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    icon: Droplet,
  },
};

export function ClinicalPatientsModal({
  isOpen,
  onClose,
  category,
  onCategoryChange,
  patients,
}: ClinicalPatientsModalProps) {
  const [search, setSearch] = useState("");
  const [selectedPatientForAppt, setSelectedPatientForAppt] = useState<
    string | null
  >(null);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);

  // SOAP State
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
  const [soapReport, setSoapReport] = useState<SOAPReport | null>(null);
  const [loadingSoapId, setLoadingSoapId] = useState<number | null>(null);

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.all_critical;
  const IconComponent = config.icon;

  // Filtragem dos pacientes conforme a categoria clínica
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // 1. Filtro por Categoria
      let matchesCategory = false;

      switch (category) {
        case "all_critical":
          matchesCategory =
            p.is_critical_bp || p.is_high_framingham || p.is_altered_dm;
          break;
        case "bp_e3":
          matchesCategory = p.bp_classification === "HIPERTENSO_E3";
          break;
        case "bp_e2":
          matchesCategory = p.bp_classification === "HIPERTENSO_E2";
          break;
        case "bp_e1":
          matchesCategory = p.bp_classification === "HIPERTENSO_E1";
          break;
        case "bp_pre":
          matchesCategory = p.bp_classification === "PRE_HIPERTENSO";
          break;
        case "bp_normal":
          matchesCategory = p.bp_classification === "NORMAL";
          break;
        case "bp_uncontrolled":
          matchesCategory = [
            "HIPERTENSO_E1",
            "HIPERTENSO_E2",
            "HIPERTENSO_E3",
          ].includes(p.bp_classification);
          break;
        case "framingham_alto":
          matchesCategory = p.framingham_score === "ALTO";
          break;
        case "framingham_moderado":
          matchesCategory = p.framingham_score === "MODERADO";
          break;
        case "dm_altered":
          matchesCategory = p.is_altered_dm;
          break;
        case "dm_insulin":
          matchesCategory = p.dm_treatment === "INSULINA";
          break;
        case "comorbidity":
          matchesCategory = p.has_comorbidity;
          break;
        case "has_only":
          matchesCategory = p.has_diagnosed && !p.dm_diagnosed;
          break;
        case "dm_only":
          matchesCategory = p.dm_diagnosed && !p.has_diagnosed;
          break;
        default:
          matchesCategory = true;
      }

      if (!matchesCategory) return false;

      // 2. Filtro de Texto (Nome ou CPF)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const cleanCpf = p.cpf.replace(/\D/g, "");
        const cleanQ = q.replace(/\D/g, "");
        const matchName = p.name.toLowerCase().includes(q);
        const matchCpf = cleanQ ? cleanCpf.includes(cleanQ) : false;

        return matchName || matchCpf;
      }

      return true;
    });
  }, [patients, category, search]);

  const handleOpenAppointment = (patientId: number) => {
    setSelectedPatientForAppt(patientId.toString());
    setIsApptModalOpen(true);
  };

  const handleOpenSoap = async (patientId: number) => {
    try {
      setLoadingSoapId(patientId);
      const report = await generateSOAPReport(patientId);

      setSoapReport(report);
      setIsSoapModalOpen(true);
    } catch {
      notifyError("Erro ao carregar relatório SOAP deste paciente.");
    } finally {
      setLoadingSoapId(null);
    }
  };

  return (
    <>
      <Modal
        classNames={{
          base: "max-h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl",
          header: "border-b border-slate-100 dark:border-zinc-800/80 p-5",
          body: "p-5",
          footer: "border-t border-slate-100 dark:border-zinc-800/80 p-4",
        }}
        isOpen={isOpen}
        scrollBehavior="inside"
        size="3xl"
        onClose={onClose}
      >
        <ModalContent>
          {() => (
            <>
              {/* Cabeçalho Interativo do Modal */}
              <ModalHeader className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shrink-0 shadow-2xs">
                      <IconComponent className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          {config.title}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badgeColor}`}
                        >
                          {config.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filtros Rápidos de Categoria */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
                  {[
                    { key: "all_critical" as const, label: "Prioritários" },
                    { key: "bp_e3" as const, label: "HAS Estágio 3" },
                    { key: "framingham_alto" as const, label: "Alto Risco" },
                    { key: "dm_altered" as const, label: "DM Alterado" },
                    { key: "dm_insulin" as const, label: "Insulino" },
                    { key: "comorbidity" as const, label: "HAS + DM" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        category === f.key
                          ? "bg-primary text-white shadow-2xs font-bold"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      }`}
                      type="button"
                      onClick={() => onCategoryChange(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Barra de Busca Rápida + Contador de Resultados */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="relative flex-1">
                    <Input
                      isClearable
                      className="w-full"
                      placeholder="Buscar por nome ou CPF..."
                      radius="lg"
                      size="sm"
                      startContent={
                        <MagnifyingGlassIcon className="size-4 text-slate-400" />
                      }
                      value={search}
                      onClear={() => setSearch("")}
                      onValueChange={setSearch}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 shrink-0 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg tabular-nums">
                    {filteredPatients.length} paciente(s)
                  </span>
                </div>
              </ModalHeader>

              {/* Corpo com a Lista de Pacientes e Ações Rápidas */}
              <ModalBody className="space-y-3">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <UserCircleIcon className="size-12 mx-auto text-slate-300 dark:text-zinc-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                      Nenhum paciente encontrado neste estrato
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                      {search
                        ? "Tente refinar sua busca por nome ou CPF."
                        : "Não há registros correspondentes a este filtro no período monitorado."}
                    </p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    const initials = patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <div
                        key={patient.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 hover:bg-white hover:shadow-xs dark:hover:bg-zinc-800 transition-all"
                      >
                        {/* Identificação do Paciente */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="size-10 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-extrabold text-sm flex items-center justify-center shrink-0">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                {capitalizeWords(patient.name)}
                              </h4>
                              {patient.is_critical_bp && (
                                <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  PA Estágio 3
                                </span>
                              )}
                              {patient.is_high_framingham && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Alto Risco Framingham
                                </span>
                              )}
                              {patient.is_altered_dm && (
                                <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  DM Descompensado
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                              CPF:{" "}
                              <span className="font-medium text-slate-700 dark:text-zinc-300">
                                {formatCpf(patient.cpf)}
                              </span>
                            </p>

                            {/* Badges Clínicas do Paciente */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                              {patient.bp_value && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-[11px] tabular-nums">
                                  <Activity className="size-3 text-primary" />
                                  PA: {patient.bp_value} mmHg
                                </span>
                              )}

                              {patient.fasting_glycemia && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] tabular-nums">
                                  <Droplet className="size-3" />
                                  Glicemia: {patient.fasting_glycemia} mg/dL
                                </span>
                              )}

                              {patient.dm_treatment &&
                                patient.dm_treatment !== "NAO_INFORMADO" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-medium text-[11px]">
                                    {patient.dm_treatment === "INSULINA"
                                      ? "Insulino"
                                      : "Oral"}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação Imediata */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Botão de Agendar Consulta Direta */}
                          <Button
                            className="bg-primary hover:bg-primary/90 text-white font-medium text-xs shadow-2xs"
                            color="primary"
                            radius="md"
                            size="sm"
                            startContent={
                              <CalendarDaysIcon className="size-3.5" />
                            }
                            onPress={() => handleOpenAppointment(patient.id)}
                          >
                            Agendar
                          </Button>

                          {/* Botão de Relatório SOAP */}
                          <Button
                            className="bg-white border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-xs shadow-2xs"
                            isLoading={loadingSoapId === patient.id}
                            radius="md"
                            size="sm"
                            startContent={
                              <DocumentTextIcon className="size-3.5 text-slate-500" />
                            }
                            variant="bordered"
                            onPress={() => handleOpenSoap(patient.id)}
                          >
                            SOAP
                          </Button>

                          {/* Link para o Prontuário Completo */}
                          <Button
                            as={Link}
                            className="bg-white border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-xs shadow-2xs"
                            href={`/pacientes/${patient.id}/editar`}
                            radius="md"
                            size="sm"
                            startContent={
                              <PencilSquareIcon className="size-3.5 text-slate-500" />
                            }
                            variant="bordered"
                          >
                            Prontuário
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </ModalBody>

              <ModalFooter className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Ações integradas com a agenda e prontuário da APS
                </span>
                <Button
                  className="font-medium text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300"
                  radius="md"
                  size="sm"
                  onPress={onClose}
                >
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Agendamento Rápido com Paciente Pré-Selecionado */}
      {selectedPatientForAppt && (
        <CreateAppointmentsModal
          open={isApptModalOpen}
          preSelectedPatientId={selectedPatientForAppt}
          onOpenChange={(open) => {
            setIsApptModalOpen(open);
            if (!open) setSelectedPatientForAppt(null);
          }}
        />
      )}

      {/* Modal de SOAP Rápido */}
      {soapReport && (
        <SOAPReportModal
          isOpen={isSoapModalOpen}
          report={soapReport}
          onClose={() => {
            setIsSoapModalOpen(false);
            setSoapReport(null);
          }}
        />
      )}
    </>
  );
}
