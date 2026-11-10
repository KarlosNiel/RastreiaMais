// frontend/components/pacientes/SOAPReportModal.tsx
"use client";

import type { SOAPReport } from "@/lib/api/soap";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import {
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { assistSOAPReport } from "@/lib/api/soap";
import { notifyError, notifySuccess, notifyWarn } from "@/components/ui/notify";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  report: SOAPReport | null;
};

/** Cores dos blocos SOAP conforme o modelo RASTREIA+ */
const BLOCK_COLORS = {
  S: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    header: "bg-blue-600",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-600 text-white",
  },
  O: {
    bg: "bg-green-50 dark:bg-green-950/40",
    header: "bg-green-600",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-600 text-white",
  },
  A: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    header: "bg-amber-600",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-600 text-white",
  },
  P: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    header: "bg-purple-600",
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-600 text-white",
  },
} as const;

function SOAPBlock({
  letter,
  title,
  sections,
}: {
  letter: keyof typeof BLOCK_COLORS;
  title: string;
  sections: { label: string; text: string | null | undefined }[];
}) {
  const colors = BLOCK_COLORS[letter];

  const copyBlock = useCallback(() => {
    const text = sections
      .filter((s) => s.text)
      .map((s) => `${s.label}\n${s.text}`)
      .join("\n\n");

    navigator.clipboard
      ?.writeText(text)
      .then(() => notifySuccess(`Bloco ${letter} copiado.`))
      .catch(() => notifyWarn("Falha ao copiar."));
  }, [sections, letter]);

  const nonEmptySections = sections.filter((s) => s.text);

  if (nonEmptySections.length === 0) return null;

  return (
    <div
      className={`rounded-lg border ${colors.border} overflow-hidden mb-6 print:break-inside-avoid`}
    >
      {/* Header */}
      <div
        className={`${colors.header} px-4 py-2 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-lg">
            {letter}
          </span>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        <button
          className="text-white/80 hover:text-white text-xs underline print:hidden transition-colors"
          type="button"
          onClick={copyBlock}
        >
          Copiar bloco
        </button>
      </div>

      {/* Sections */}
      <div className={`${colors.bg}`}>
        {nonEmptySections.map((s, i) => (
          <div
            key={i}
            className={`px-4 py-3 ${i > 0 ? `border-t ${colors.border}` : ""}`}
          >
            <p className="text-xs font-bold text-foreground/70 mb-1 uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Badge de status do Previne Brasil */
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    ATINGIDO:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    "EM CURSO":
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    PENDENTE:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md border text-xs font-medium ${colorMap[status] ?? colorMap["PENDENTE"]}`}
    >
      {status}
    </span>
  );
}

export default function SOAPReportModal({ isOpen, onClose, report }: Props) {
  const [currentReport, setCurrentReport] = useState<SOAPReport | null>(report);
  const [isAssisting, setIsAssisting] = useState(false);

  useEffect(() => {
    setCurrentReport(report);
  }, [report]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyFullSOAP = useCallback(() => {
    if (!currentReport) return;

    const sections = [
      `PACIENTE: ${currentReport.paciente.nome} | CPF: ${currentReport.paciente.cpf || "—"} | Idade: ${currentReport.paciente.idade ?? "—"} anos`,
      currentReport.is_ai_enhanced
        ? `[RELATÓRIO CLÍNICO APRIMORADO — ASSISTENTE SOFIA]`
        : null,
      currentReport.alertas_clinicos &&
      currentReport.alertas_clinicos.length > 0
        ? `ALERTAS CLÍNICOS (APS):\n${currentReport.alertas_clinicos.map((a) => `• ${a}`).join("\n")}`
        : null,
      `--- SUBJETIVO (S) ---`,
      currentReport.subjetivo.identificacao,
      currentReport.subjetivo.historico,
      currentReport.subjetivo.determinantes,
      currentReport.subjetivo.estilo_vida,
      `--- OBJETIVO (O) ---`,
      currentReport.objetivo.pressao_arterial,
      currentReport.objetivo.antropometria,
      currentReport.objetivo.glicemia_metabolico,
      currentReport.objetivo.exame_fisico,
      `--- AVALIAÇÃO (A) ---`,
      currentReport.avaliacao.hipertensao,
      currentReport.avaliacao.diabetes,
      currentReport.avaliacao.risco_cardiovascular,
      currentReport.avaliacao.riscos_psicossociais,
      currentReport.avaliacao.outras_dcnts,
      `--- PLANO (P) ---`,
      currentReport.plano.conduta_clinica,
      currentReport.plano.exames_solicitados,
      currentReport.plano.encaminhamentos,
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard
      ?.writeText(sections)
      .then(() =>
        notifySuccess("SOAP completo copiado para a área de transferência!"),
      )
      .catch(() => notifyWarn("Falha ao copiar SOAP."));
  }, [currentReport]);

  const handleAIAssist = useCallback(async () => {
    if (!currentReport) return;
    try {
      setIsAssisting(true);
      const enhanced = await assistSOAPReport({
        patientId: currentReport.paciente.id || undefined,
        baseSoap: currentReport,
      });

      if (enhanced) {
        setCurrentReport(enhanced);
        notifySuccess("SOAP aprimorado com sucesso pela Assistente Sofia!");
      }
    } catch (err: any) {
      console.error("Assist error:", err);
      const status = err?.response?.status;
      let msg = "Erro ao processar assistência com IA.";

      if (status === 404) {
        msg =
          "O endpoint de IA ainda não foi atualizado no servidor (404). Verifique o deploy do backend.";
      } else if (err?.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err?.message) {
        msg = err.message;
      }

      notifyError(msg);
    } finally {
      setIsAssisting(false);
    }
  }, [currentReport]);

  if (!currentReport) return null;

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "rounded-2xl shadow-2xl dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800",
        header:
          "border-b border-slate-100 dark:border-zinc-800/80 pb-4 pt-5 px-6 print:hidden",
        body: "px-6 py-6",
        footer:
          "border-t border-slate-100 dark:border-zinc-800/80 py-4 px-6 bg-slate-50/50 dark:bg-zinc-900/50 print:hidden",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Relatório SOAP — RASTREIA+</h2>
              {currentReport.is_ai_enhanced && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <SparklesIcon className="size-3.5" />
                  Assistente Sofia (APS)
                </span>
              )}
            </div>
            <p className="text-xs text-foreground/60">
              Modelo de Relatório SOAP para Integração com o PEC/e-SUS
            </p>
          </div>
          {!currentReport.is_ai_enhanced && (
            <Button
              className="font-medium shrink-0 bg-teal-600 hover:bg-teal-700 text-white"
              isLoading={isAssisting}
              radius="lg"
              size="sm"
              startContent={<SparklesIcon className="size-4" />}
              onPress={handleAIAssist}
            >
              Aprimorar com Sofia
            </Button>
          )}
        </ModalHeader>

        <ModalBody className="px-6">
          {/* Print header (visible only when printing) */}
          <div className="hidden print:block mb-6 text-center">
            <h1 className="text-2xl font-bold">RASTREIA+</h1>
            <p className="text-sm text-gray-600">
              Modelo de Relatório SOAP para Integração com o PEC/e-SUS
            </p>
            <hr className="mt-2" />
          </div>

          {/* Paciente info */}
          <div className="rounded-lg border border-default-200 bg-default-50 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-foreground/60 text-xs">Paciente</p>
                <p className="font-semibold">
                  {currentReport.paciente.nome || "—"}
                </p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs">CPF</p>
                <p className="font-semibold">
                  {currentReport.paciente.cpf || "—"}
                </p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs">Nascimento</p>
                <p className="font-semibold">
                  {currentReport.paciente.nascimento || "—"}
                </p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs">Idade</p>
                <p className="font-semibold">
                  {currentReport.paciente.idade != null
                    ? `${currentReport.paciente.idade} anos`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Alertas Clínicos (se houver) */}
          {currentReport.alertas_clinicos &&
            currentReport.alertas_clinicos.length > 0 && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/40 p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Alertas e Oportunidades Clínicas Identificadas por Sofia
                  </h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-200">
                  {currentReport.alertas_clinicos.map((alerta, idx) => (
                    <li key={idx}>{alerta}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Blocos SOAP */}
          <SOAPBlock
            letter="S"
            sections={[
              {
                label: "Identificação e queixas principais",
                text: currentReport.subjetivo.identificacao,
              },
              {
                label: "Histórico e contexto clínico",
                text: currentReport.subjetivo.historico,
              },
              {
                label: "Determinantes sociais e psicossociais",
                text: currentReport.subjetivo.determinantes,
              },
              {
                label: "Estilo de vida",
                text: currentReport.subjetivo.estilo_vida,
              },
            ]}
            title="Subjetivo — o que o paciente relata e a história clínica"
          />

          <SOAPBlock
            letter="O"
            sections={[
              {
                label: "Pressão arterial",
                text: currentReport.objetivo.pressao_arterial,
              },
              {
                label: "Antropometria",
                text: currentReport.objetivo.antropometria,
              },
              {
                label: "Glicemia e metabólico",
                text: currentReport.objetivo.glicemia_metabolico,
              },
              {
                label: "Exame físico sumário",
                text: currentReport.objetivo.exame_fisico,
              },
            ]}
            title="Objetivo — dados clínicos mensurados na avaliação"
          />

          <SOAPBlock
            letter="A"
            sections={[
              {
                label: "Hipertensão arterial",
                text: currentReport.avaliacao.hipertensao,
              },
              {
                label: "Diabetes mellitus",
                text: currentReport.avaliacao.diabetes,
              },
              {
                label: "Risco cardiovascular",
                text: currentReport.avaliacao.risco_cardiovascular,
              },
              {
                label: "Riscos psicossociais e sociais identificados",
                text: currentReport.avaliacao.riscos_psicossociais,
              },
              {
                label: "Outras DCNTs",
                text: currentReport.avaliacao.outras_dcnts,
              },
            ]}
            title="Avaliação — classificação consolidada e estratificação de risco"
          />

          <SOAPBlock
            letter="P"
            sections={[
              {
                label: "Conduta clínica imediata",
                text: currentReport.plano.conduta_clinica,
              },
              {
                label: "Exames solicitados",
                text: currentReport.plano.exames_solicitados,
              },
              {
                label: "Encaminhamentos multiprofissionais",
                text: currentReport.plano.encaminhamentos,
              },
            ]}
            title="Plano — condutas, encaminhamentos e agendamentos"
          />

          {/* Indicadores do Previne Brasil */}
          {currentReport.indicadores_previne.length > 0 && (
            <div className="rounded-lg border border-default-200 overflow-hidden mb-4 print:break-inside-avoid">
              <div className="bg-gray-700 px-4 py-2">
                <h3 className="text-white font-semibold text-sm">
                  Indicadores do Previne Brasil ativados por este SOAP
                </h3>
              </div>
              <div className="divide-y divide-default-200">
                {currentReport.indicadores_previne.map((ind, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <span className="text-sm">{ind.indicador}</span>
                    <StatusBadge status={ind.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aviso Legal CFM/COFEN */}
          {currentReport.ai_disclaimer && (
            <p className="text-[11px] text-muted-foreground/80 italic text-center mt-3 mb-1 px-4">
              {currentReport.ai_disclaimer}
            </p>
          )}

          {/* Rodapé */}
          <p className="text-xs text-foreground/50 text-center mt-4 mb-2">
            Gerado em {currentReport.gerado_em} — RASTREIA+ v1.0
          </p>
        </ModalBody>

        <ModalFooter className="print:hidden flex flex-wrap justify-between items-center gap-2">
          <Button
            className="font-medium text-slate-700 dark:text-zinc-300"
            radius="md"
            variant="flat"
            onPress={onClose}
          >
            Fechar
          </Button>
          <div className="flex items-center gap-2">
            <Button
              className="font-medium"
              color="secondary"
              radius="md"
              startContent={<ClipboardDocumentCheckIcon className="size-4" />}
              variant="flat"
              onPress={handleCopyFullSOAP}
            >
              Copiar para PEC/e-SUS
            </Button>
            <Button
              className="font-medium"
              color="primary"
              radius="md"
              startContent={<PrinterIcon className="size-4" />}
              onPress={handlePrint}
            >
              Imprimir / PDF
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
