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
import { useCallback } from "react";
import {
  ClipboardDocumentCheckIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";

import { notifySuccess, notifyWarn } from "@/components/ui/notify";

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
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyFullSOAP = useCallback(() => {
    if (!report) return;

    const sections = [
      `PACIENTE: ${report.paciente.nome} | CPF: ${report.paciente.cpf || "—"} | Idade: ${report.paciente.idade ?? "—"} anos`,
      `--- SUBJETIVO (S) ---`,
      report.subjetivo.identificacao,
      report.subjetivo.historico,
      report.subjetivo.determinantes,
      report.subjetivo.estilo_vida,
      `--- OBJETIVO (O) ---`,
      report.objetivo.pressao_arterial,
      report.objetivo.antropometria,
      report.objetivo.glicemia_metabolico,
      report.objetivo.exame_fisico,
      `--- AVALIAÇÃO (A) ---`,
      report.avaliacao.hipertensao,
      report.avaliacao.diabetes,
      report.avaliacao.risco_cardiovascular,
      report.avaliacao.riscos_psicossociais,
      report.avaliacao.outras_dcnts,
      `--- PLANO (P) ---`,
      report.plano.conduta_clinica,
      report.plano.exames_solicitados,
      report.plano.encaminhamentos,
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard
      ?.writeText(sections)
      .then(() =>
        notifySuccess("SOAP completo copiado para a área de transferência!"),
      )
      .catch(() => notifyWarn("Falha ao copiar SOAP."));
  }, [report]);

  if (!report) return null;

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 print:hidden">
          <h2 className="text-lg font-bold">Relatório SOAP — RASTREIA+</h2>
          <p className="text-xs text-foreground/60">
            Modelo de Relatório SOAP para Integração com o PEC/e-SUS
          </p>
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
                <p className="font-semibold">{report.paciente.nome || "—"}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs">CPF</p>
                <p className="font-semibold">{report.paciente.cpf || "—"}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs">Nascimento</p>
                <p className="font-semibold">
                  {report.paciente.nascimento || "—"}
                </p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs">Idade</p>
                <p className="font-semibold">
                  {report.paciente.idade != null
                    ? `${report.paciente.idade} anos`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Blocos SOAP */}
          <SOAPBlock
            letter="S"
            sections={[
              {
                label: "Identificação e queixas principais",
                text: report.subjetivo.identificacao,
              },
              {
                label: "Histórico e contexto clínico",
                text: report.subjetivo.historico,
              },
              {
                label: "Determinantes sociais e psicossociais",
                text: report.subjetivo.determinantes,
              },
              { label: "Estilo de vida", text: report.subjetivo.estilo_vida },
            ]}
            title="Subjetivo — o que o paciente relata e a história clínica"
          />

          <SOAPBlock
            letter="O"
            sections={[
              {
                label: "Pressão arterial",
                text: report.objetivo.pressao_arterial,
              },
              { label: "Antropometria", text: report.objetivo.antropometria },
              {
                label: "Glicemia e metabólico",
                text: report.objetivo.glicemia_metabolico,
              },
              {
                label: "Exame físico sumário",
                text: report.objetivo.exame_fisico,
              },
            ]}
            title="Objetivo — dados clínicos mensurados na avaliação"
          />

          <SOAPBlock
            letter="A"
            sections={[
              {
                label: "Hipertensão arterial",
                text: report.avaliacao.hipertensao,
              },
              {
                label: "Diabetes mellitus",
                text: report.avaliacao.diabetes,
              },
              {
                label: "Risco cardiovascular",
                text: report.avaliacao.risco_cardiovascular,
              },
              {
                label: "Riscos psicossociais e sociais identificados",
                text: report.avaliacao.riscos_psicossociais,
              },
              {
                label: "Outras DCNTs",
                text: report.avaliacao.outras_dcnts,
              },
            ]}
            title="Avaliação — classificação consolidada e estratificação de risco"
          />

          <SOAPBlock
            letter="P"
            sections={[
              {
                label: "Conduta clínica imediata",
                text: report.plano.conduta_clinica,
              },
              {
                label: "Exames solicitados",
                text: report.plano.exames_solicitados,
              },
              {
                label: "Encaminhamentos multiprofissionais",
                text: report.plano.encaminhamentos,
              },
            ]}
            title="Plano — condutas, encaminhamentos e agendamentos"
          />

          {/* Indicadores do Previne Brasil */}
          {report.indicadores_previne.length > 0 && (
            <div className="rounded-lg border border-default-200 overflow-hidden mb-4 print:break-inside-avoid">
              <div className="bg-gray-700 px-4 py-2">
                <h3 className="text-white font-semibold text-sm">
                  Indicadores do Previne Brasil ativados por este SOAP
                </h3>
              </div>
              <div className="divide-y divide-default-200">
                {report.indicadores_previne.map((ind, i) => (
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

          {/* Rodapé */}
          <p className="text-xs text-foreground/50 text-center mt-4 mb-2">
            Gerado em {report.gerado_em} — RASTREIA+ v1.0
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
