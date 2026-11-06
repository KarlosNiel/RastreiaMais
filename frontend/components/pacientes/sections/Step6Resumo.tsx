// frontend/components/pacientes/sections/Step6Resumo.tsx
"use client";

import type { SOAPReport } from "@/lib/api/soap";
import { assistSOAPReport } from "@/lib/api/soap";

import { Button, Card, CardBody, Input } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import SOAPReportModal from "@/components/pacientes/SOAPReportModal";
import { notifyError, notifySuccess, notifyWarn } from "@/components/ui/notify";


/* ── Label maps (replicados do backend para montagem client-side) ── */

const GENDER_MAP: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

const SMOKING_MAP: Record<string, string> = {
  nunca: "NUNCA FUMOU",
  ex: "EX-FUMANTE",
  atual: "FUMANTE ATUAL",
};

const ALCOHOL_MAP: Record<string, string> = {
  nao_bebe: "NÃO BEBE",
  socialmente: "SOCIALMENTE",
  frequentemente: "FREQUENTEMENTE",
};

const FEED_MAP: Record<string, string> = {
  saudavel: "SAUDÁVEL",
  parcial: "PARCIALMENTE SAUDÁVEL",
  pouco: "POUCO SAUDÁVEL",
};

const SALT_MAP: Record<string, string> = {
  adequado: "ADEQUADO",
  exagerado: "EXAGERADO",
  nao_sabe: "NÃO SABE",
};

const BP_MAP: Record<string, string> = {
  normal: "Normal",
  pre_hipertenso: "Pré-hipertenso",
  estagio1: "Hipertenso Estágio 1",
  estagio2: "Hipertenso Estágio 2",
  estagio3: "Hipertenso Estágio 3",
};

const FRAMINGHAM_MAP: Record<string, string> = {
  "<10": "<10% — risco BAIXO",
  "10-20": "10–20% — risco MODERADO",
  ">20": ">20% — risco ALTO",
};

const TREATMENT_MAP: Record<string, string> = {
  sim: "REGULAR",
  nao: "NÃO USA",
  irregular: "IRREGULAR",
  nao_se_aplica: "NÃO SE APLICA",
};

const CONDUCT_HAS_MAP: Record<string, string> = {
  aps: "acompanhamento na APS",
  encaminhamento: "encaminhamento médico",
  grupo: "aconselhamento em grupo",
};

const SCREENING_MAP: Record<string, string> = {
  normal: "sem alterações glicêmicas identificadas na triagem",
  glicemia_alterada: "glicemia alterada — confirmar com jejum",
  suspeita_dm: "suspeita forte de DM — confirmação laboratorial urgente",
  diagnostico_confirmado: "diagnóstico confirmado de DM",
};

const REFERRAL_MAP: Record<string, string> = {
  psicologo: "Psicólogo",
  medico_vet: "Médico Veterinário",
  fisioterapeuta: "Fisioterapeuta",
  assistente_social: "Assistente Social",
  enfermeira: "Enfermeira",
  nutricionista: "Nutricionista",
  cirurgia_dentista: "Cirurgiã-Dentista",
};

/* ── Helpers ── */

function calcAge(birth: string | Date | undefined | null): number | null {
  if (!birth) return null;
  const d = new Date(birth);

  if (isNaN(d.getTime())) return null;
  const today = new Date();

  return (
    today.getFullYear() -
    d.getFullYear() -
    (today.getMonth() < d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())
      ? 1
      : 0)
  );
}

function boolLabel(
  val: string | boolean | undefined | null,
  t = "SIM",
  f = "NÃO",
): string | null {
  if (val === true || val === "sim") return t;
  if (val === false || val === "nao") return f;

  return null;
}

function fmtDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const dt = new Date(d);

  if (isNaN(dt.getTime())) return null;

  return dt.toLocaleDateString("pt-BR");
}

/* ── Block colors ── */

const BLOCK_COLORS = {
  S: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    header: "bg-blue-600",
    border: "border-blue-200 dark:border-blue-800",
  },
  O: {
    bg: "bg-green-50 dark:bg-green-950/40",
    header: "bg-green-600",
    border: "border-green-200 dark:border-green-800",
  },
  A: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    header: "bg-amber-600",
    border: "border-amber-200 dark:border-amber-800",
  },
  P: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    header: "bg-purple-600",
    border: "border-purple-200 dark:border-purple-800",
  },
} as const;

function SOAPBlock({
  letter,
  title,
  isSofiaEnhanced,
  sections,
}: {
  letter: keyof typeof BLOCK_COLORS;
  title: string;
  isSofiaEnhanced?: boolean;
  sections: { label: string; text: string | null | undefined }[];
}) {
  const colors = BLOCK_COLORS[letter];

  const copyBlock = useCallback(() => {
    const text = sections
      .filter((s) => s.text)
      .map((s) => `${s.label.toUpperCase()}:\n${s.text}`)
      .join("\n\n");

    navigator.clipboard
      ?.writeText(text)
      .then(() => notifySuccess(`Bloco ${letter} copiado para a área de transferência.`))
      .catch(() => notifyWarn("Falha ao copiar bloco."));
  }, [sections, letter]);

  const nonEmpty = sections.filter((s) => s.text);

  if (nonEmpty.length === 0) return null;

  return (
    <div className={`rounded-xl border ${colors.border} overflow-hidden shadow-2xs transition-all`}>
      <div
        className={`${colors.header} px-4 py-2.5 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white font-bold text-base shadow-xs">
            {letter}
          </span>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {isSofiaEnhanced && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/20 text-white backdrop-blur-xs">
              <SparklesIcon className="size-3" /> Sofia
            </span>
          )}
        </div>
        <button
          className="text-white/90 hover:text-white text-xs font-medium px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
          type="button"
          onClick={copyBlock}
        >
          <ClipboardDocumentCheckIcon className="size-3.5" />
          Copiar bloco
        </button>
      </div>

      <div className={`${colors.bg}`}>
        {nonEmpty.map((s, i) => (
          <div
            key={i}
            className={`px-4 py-3.5 ${i > 0 ? `border-t ${colors.border}` : ""}`}
          >
            <p className="text-[11px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    ATINGIDO:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    "EM CURSO":
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    PENDENTE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[status] ?? colorMap["PENDENTE"]}`}
    >
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  COMPONENTE PRINCIPAL: Step6Resumo
 * ═══════════════════════════════════════════════════════════════ */

export default function Step6Resumo() {
  const { getValues } = useFormContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [aiReport, setAiReport] = useState<SOAPReport | null>(null);
  const [activeMode, setActiveMode] = useState<"form" | "ai">("form");
  const [isAssisting, setIsAssisting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");


  /* ── Extrai dados do formulário ── */
  const buildSOAPFromForm = useCallback((): SOAPReport => {
    const vals = getValues();
    const socio = vals.socio ?? {};
    const cond = vals.condicoes ?? {};
    const hasData = vals.clinica?.has;
    const dmData = vals.clinica?.dm;
    const multiprof = vals.multiprof ?? {};

    const nome = socio.nome ?? "—";
    const idade = calcAge(socio.nascimento);
    const genero = GENDER_MAP[socio.genero ?? ""] ?? "—";
    const raca = socio.raca_etnia ?? "—";
    const ocupacao = socio.ocupacao ?? "—";

    // ── S ── Subjetivo
    const idParts = [`Paciente ${genero}`];

    if (idade !== null) idParts.push(`${idade} anos`);
    idParts.push(raca, ocupacao);

    const diagParts: string[] = [];

    if (cond.has && hasData) {
      const med = TREATMENT_MAP[hasData.usa_medicacao ?? ""] ?? "—";

      diagParts.push(
        `diagnóstico prévio de hipertensão arterial sistêmica — uso de medicação: ${med}`,
      );
    }
    if (cond.dm && dmData) {
      const med = TREATMENT_MAP[dmData.usa_medicacao ?? ""] ?? "—";

      diagParts.push(
        `diagnóstico prévio de diabetes mellitus — uso de medicação: ${med}`,
      );
    }
    if (!cond.has && !cond.dm) {
      diagParts.push("sem diagnóstico prévio conhecido para HAS/DM");
    }

    const identificacao = `${idParts.join(", ")}. ${diagParts.join(". ")}.`;

    // Histórico
    const histParts: string[] = [];
    const lastConsult =
      hasData?.ultima_consulta_has ?? dmData?.ultima_consulta_dm;

    if (lastConsult) {
      histParts.push(`Última consulta para avaliação há ${lastConsult}`);
    }

    const famHas = boolLabel(hasData?.historico_familiar);
    const famDm = boolLabel(dmData?.historico_familiar);
    const famItems: string[] = [];

    if (famHas === "SIM") famItems.push("HAS");
    if (famDm === "SIM") famItems.push("DM");
    histParts.push(
      famItems.length
        ? `Histórico familiar positivo para ${famItems.join(", ")}`
        : "Histórico familiar negativo",
    );

    const historico = histParts.join(". ") + ".";

    // Determinantes sociais
    const socialParts: string[] = [];
    const stress = boolLabel(
      multiprof.psico_estresse_interfere,
      "INTERFERE",
      "NÃO INTERFERE",
    );

    if (stress)
      socialParts.push(
        `Estresse do dia a dia ${stress} no controle de sua condição`,
      );
    const econ = boolLabel(
      multiprof.psico_fatores_economicos,
      "DIFICULTAM",
      "NÃO DIFICULTAM",
    );

    if (econ)
      socialParts.push(
        `Fatores econômicos ${econ} a continuidade do tratamento`,
      );
    const apoio = boolLabel(multiprof.psico_apoio_suficiente);

    if (apoio) socialParts.push(`Apoio familiar: ${apoio}`);
    const bf = boolLabel(socio.bolsa_familia);

    if (bf) socialParts.push(`Beneficiário do Bolsa Família: ${bf}`);

    const determinantes = socialParts.length
      ? socialParts.join(". ") + "."
      : "";

    // Estilo de vida
    const lifeSrc = hasData ?? dmData ?? {};
    const tabagismo = SMOKING_MAP[lifeSrc.tabagismo ?? ""] ?? "—";
    const etilismo = ALCOHOL_MAP[lifeSrc.alcool ?? ""] ?? "—";
    const alimentacao = FEED_MAP[lifeSrc.estilo_alimentacao ?? ""] ?? "—";
    const sal = SALT_MAP[lifeSrc.sal ?? ""] ?? "—";

    let atividadeLabel = "—";

    if (multiprof.fisico_atividade === "sim") {
      const freq = multiprof.fisico_atividade_freq_semana;

      atividadeLabel = freq ? `PRATICA — ${freq}x/semana` : "PRATICA";
    } else if (multiprof.fisico_atividade === "nao") {
      atividadeLabel = "SEDENTÁRIO";
    }

    const estiloVida = `Tabagismo: ${tabagismo}. Etilismo: ${etilismo}. Atividade física: ${atividadeLabel}. Alimentação referida: ${alimentacao}. Consumo de sal: ${sal}.`;

    // ── O ── Objetivo
    let pressaoArterial: string | null = null;

    if (hasData) {
      const paParts: string[] = [];

      if (hasData.pa1_sis && hasData.pa1_dia) {
        paParts.push(`1ª aferição: ${hasData.pa1_sis}/${hasData.pa1_dia} mmHg`);
      }
      if (hasData.pa2_sis && hasData.pa2_dia) {
        paParts.push(`2ª aferição: ${hasData.pa2_sis}/${hasData.pa2_dia} mmHg`);
      }
      if (paParts.length) {
        paParts.push("Aferição realizada em repouso, posição sentada.");
        pressaoArterial = paParts.join(". ");
      }
    }

    const antroSrc = hasData ?? dmData;
    let antropometria: string | null = null;

    if (antroSrc) {
      const ap: string[] = [];

      if (antroSrc.peso) ap.push(`Peso: ${antroSrc.peso} kg`);
      if (antroSrc.altura) ap.push(`Altura: ${antroSrc.altura} m`);
      if (antroSrc.imc) {
        const imc = Number(antroSrc.imc);
        let imcClass = "";

        if (imc < 18.5) imcClass = "Abaixo do peso";
        else if (imc < 25) imcClass = "Normal";
        else if (imc < 30) imcClass = "Sobrepeso";
        else if (imc < 35) imcClass = "Obesidade grau I";
        else if (imc < 40) imcClass = "Obesidade grau II";
        else imcClass = "Obesidade grau III";
        ap.push(`IMC: ${antroSrc.imc} kg/m² — classificação: ${imcClass}`);
      }
      if (antroSrc.circ_abdominal)
        ap.push(`Circunferência abdominal: ${antroSrc.circ_abdominal} cm`);
      if (ap.length) antropometria = ap.join(". ") + ".";
    }

    let glicemiaMetabolico: string | null = null;
    const gParts: string[] = [];

    if (dmData) {
      if (dmData.glicemia_aleatoria)
        gParts.push(
          `Glicemia capilar aleatória: ${dmData.glicemia_aleatoria} mg/dL`,
        );
      if (dmData.glicemia_jejum)
        gParts.push(
          `Glicemia capilar em jejum: ${dmData.glicemia_jejum} mg/dL`,
        );
      if (dmData.hba1c)
        gParts.push(`Hemoglobina glicada (HbA1c): ${dmData.hba1c}%`);
    }
    if (hasData) {
      if (hasData.col_total) {
        let txt = `Colesterol total: ${hasData.col_total} mg/dL`;

        if (hasData.col_total_data)
          txt += `. Data: ${fmtDate(hasData.col_total_data)}`;
        gParts.push(txt);
      }
      if (hasData.hdl) {
        let txt = `HDL: ${hasData.hdl} mg/dL`;

        if (hasData.hdl_data) txt += `. Data: ${fmtDate(hasData.hdl_data)}`;
        gParts.push(txt);
      }
    }
    if (gParts.length) glicemiaMetabolico = gParts.join(". ") + ".";

    // Exame físico sumário
    const eParts: string[] = [];
    const edema = boolLabel(multiprof.fisico_edemas, "PRESENTE", "AUSENTE");

    if (edema) eParts.push(`Edemas: ${edema}`);
    const dispneia = boolLabel(
      multiprof.fisico_dispneia,
      "PRESENTE",
      "AUSENTE",
    );

    if (dispneia) eParts.push(`Dispneia: ${dispneia}`);
    const parestesia = boolLabel(multiprof.fisico_formigamento_caimbras);

    if (parestesia)
      eParts.push(`Queixas de formigamento ou câimbras: ${parestesia}`);
    const difCaminhar = boolLabel(multiprof.fisico_dificuldade_caminhar);

    if (difCaminhar)
      eParts.push(
        `Dificuldade para caminhar ou realizar atividades: ${difCaminhar}`,
      );
    if (dmData?.pe_diabetico === "sim") {
      eParts.push(
        `Pé diabético identificado — membro: ${dmData.pe_diabetico_membro ?? "—"}`,
      );
    }
    const exameFisico = eParts.length ? eParts.join(". ") + "." : null;

    // ── A ── Avaliação
    let hipertensao: string | null = null;

    if (cond.has && hasData) {
      if (hasData.diag_has === "sim") {
        const classPa = BP_MAP[hasData.classificacao_pa ?? ""] ?? "—";
        const med = TREATMENT_MAP[hasData.usa_medicacao ?? ""] ?? "—";

        hipertensao = `HAS — classificação: ${classPa}. Adesão medicamentosa: ${med}.`;
      } else {
        hipertensao =
          "Sem diagnóstico prévio de HAS — valores aferidos sugestivos, necessária confirmação.";
      }
    }

    let diabetes: string | null = null;

    if (cond.dm && dmData) {
      if (dmData.diag_dm === "sim") {
        diabetes = "DM CONFIRMADA.";
      } else {
        const screening = SCREENING_MAP[dmData.triagem_dm ?? ""] ?? "";

        diabetes = screening
          ? `Triagem: ${screening}.`
          : "Sem alterações glicêmicas identificadas na triagem.";
      }
    }

    let riscoCv: string | null = null;

    if (hasData?.framingham) {
      const framLabel =
        FRAMINGHAM_MAP[hasData.framingham] ?? hasData.framingham;

      riscoCv = `Score de Framingham: ${framLabel}.`;
      if (antroSrc?.imc)
        riscoCv +=
          " IMC e circunferência abdominal contribuem para risco metabólico.";
    }

    const riscoSocParts: string[] = [];

    if (multiprof.psico_estresse_interfere === "sim")
      riscoSocParts.push("estresse com impacto no controle");
    if (multiprof.psico_fatores_economicos === "sim")
      riscoSocParts.push("barreira econômica ao tratamento");
    if (multiprof.psico_apoio_suficiente === "nao")
      riscoSocParts.push("ausência de apoio familiar");
    const riscosPsicossociais = riscoSocParts.length
      ? riscoSocParts.join(", ") + "."
      : "Sem riscos psicossociais significativos identificados nesta avaliação.";

    const outrasDcnts = cond.outras_dcnts
      ? `Paciente refere diagnóstico de ${cond.outras_dcnts}.`
      : "Sem outras doenças crônicas não transmissíveis relatadas.";

    // ── P ── Plano
    const condutaParts: string[] = [];

    if (hasData?.condutas?.length) {
      hasData.condutas.forEach((c: string) => {
        const label = CONDUCT_HAS_MAP[c];

        if (label) condutaParts.push(label);
      });
    }
    if (hasData?.usa_medicacao === "irregular") {
      const meds = hasData.medicamentos ?? "os medicamentos prescritos";

      condutaParts.push(
        `Reforço de orientação sobre adesão medicamentosa para ${meds}`,
      );
    }
    const condutaClinica = condutaParts.length
      ? condutaParts.join(". ") + "."
      : "Nenhuma conduta clínica imediata registrada.";

    const exames: string[] = [];

    if (cond.dm) {
      exames.push("glicemia em jejum", "HbA1c");
    }
    if (cond.has && !hasData?.col_total) {
      exames.push("colesterol total e frações");
    }
    const examesSolicitados = exames.length
      ? exames.join(", ") + "."
      : "Nenhum exame solicitado nesta avaliação.";

    let encaminhamentos =
      "Sem necessidade de encaminhamento multiprofissional identificada nesta avaliação.";

    if (
      multiprof.precisa_enc_multiprof === "sim" &&
      multiprof.enc_multiprof?.length
    ) {
      const profs = (multiprof.enc_multiprof as string[])
        .map((p: string) => REFERRAL_MAP[p] ?? p)
        .join(", ");

      encaminhamentos = `Encaminhamento multiprofissional para ${profs}.`;
    }

    // Indicadores Previne Brasil
    const indicadores = [
      {
        indicador: "PA aferida e registrada em hipertenso",
        status: (hasData?.pa1_sis && hasData?.pa1_dia
          ? "ATINGIDO"
          : "PENDENTE") as "ATINGIDO" | "PENDENTE",
      },
      {
        indicador: "Acompanhamento de pessoa com DCNT",
        status: (cond.has || cond.dm ? "ATINGIDO" : "PENDENTE") as
          | "ATINGIDO"
          | "PENDENTE",
      },
      {
        indicador: "HbA1c solicitada em diabético ou suspeito",
        status: (dmData?.hba1c
          ? "ATINGIDO"
          : cond.dm
            ? "EM CURSO"
            : "PENDENTE") as "ATINGIDO" | "EM CURSO" | "PENDENTE",
      },
      {
        indicador: "Cadastro individual qualificado",
        status: (socio.nascimento && socio.genero && socio.sus_cpf
          ? "ATINGIDO"
          : "PENDENTE") as "ATINGIDO" | "PENDENTE",
      },
    ];

    return {
      paciente: {
        id: 0,
        nome,
        cpf: socio.sus_cpf ?? null,
        nascimento: fmtDate(socio.nascimento),
        idade,
      },
      subjetivo: {
        identificacao,
        historico,
        determinantes,
        estilo_vida: estiloVida,
      },
      objetivo: {
        pressao_arterial: pressaoArterial,
        antropometria,
        glicemia_metabolico: glicemiaMetabolico,
        exame_fisico: exameFisico,
      },
      avaliacao: {
        hipertensao,
        diabetes,
        risco_cardiovascular: riscoCv,
        riscos_psicossociais: riscosPsicossociais,
        outras_dcnts: outrasDcnts,
      },
      plano: {
        conduta_clinica: condutaClinica,
        exames_solicitados: examesSolicitados,
        encaminhamentos,
      },
      indicadores_previne: indicadores,
      gerado_em: new Date().toLocaleDateString("pt-BR"),
    };
  }, [getValues]);

  /* ── Dados montados a partir do form ── */
  const formReport = useMemo(() => buildSOAPFromForm(), [buildSOAPFromForm]);
  const activeReport = activeMode === "ai" && aiReport ? aiReport : formReport;

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleCopyFullSOAP = useCallback(() => {
    if (!activeReport) return;

    const lines = [
      `PACIENTE: ${activeReport.paciente.nome || "—"} | CPF: ${activeReport.paciente.cpf || "—"} | IDADE: ${activeReport.paciente.idade ?? "—"} anos`,
      activeReport.is_ai_enhanced ? `[RELATÓRIO CLÍNICO APRIMORADO — ASSISTENTE SOFIA]` : null,
      activeReport.alertas_clinicos && activeReport.alertas_clinicos.length > 0
        ? `ALERTAS CLÍNICOS:\n${activeReport.alertas_clinicos.map((a) => `• ${a}`).join("\n")}`
        : null,
      `\n--- SUBJETIVO (S) ---`,
      activeReport.subjetivo.identificacao,
      activeReport.subjetivo.historico,
      activeReport.subjetivo.determinantes,
      activeReport.subjetivo.estilo_vida,
      `\n--- OBJETIVO (O) ---`,
      activeReport.objetivo.pressao_arterial,
      activeReport.objetivo.antropometria,
      activeReport.objetivo.glicemia_metabolico,
      activeReport.objetivo.exame_fisico,
      `\n--- AVALIAÇÃO (A) ---`,
      activeReport.avaliacao.hipertensao,
      activeReport.avaliacao.diabetes,
      activeReport.avaliacao.risco_cardiovascular,
      activeReport.avaliacao.riscos_psicossociais,
      activeReport.avaliacao.outras_dcnts,
      `\n--- PLANO (P) ---`,
      activeReport.plano.conduta_clinica,
      activeReport.plano.exames_solicitados,
      activeReport.plano.encaminhamentos,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard
      ?.writeText(lines)
      .then(() => notifySuccess("SOAP completo copiado para a área de transferência!"))
      .catch(() => notifyWarn("Falha ao copiar SOAP."));
  }, [activeReport]);

  const handleAIAssist = useCallback(
    async (customNotes?: string) => {
      const notesToUse = typeof customNotes === "string" ? customNotes : notes;
      try {
        setIsAssisting(true);
        const enhanced = await assistSOAPReport({
          baseSoap: formReport,
          professionalNotes: notesToUse,
        });

        if (enhanced) {
          setAiReport(enhanced);
          setActiveMode("ai");
          notifySuccess("Sofia refinou o resumo SOAP com sucesso!");
        }
      } catch {
        notifyError("Erro ao processar assistência clínica.");
      } finally {
        setIsAssisting(false);
      }
    },
    [formReport, notes],
  );

  const quickChips = [
    "Tontura matinal ao levantar",
    "Tosse seca suspeita de IECA",
    "Reforçar dieta DASH e autocuidado",
    "Rastreio anual de lesão de órgão-alvo",
  ];

  return (
    <div className="space-y-6">
      {/* ── Sofia Copilot Hero Card ── */}
      <div className="rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 dark:from-teal-950/20 dark:via-zinc-900 dark:to-zinc-950 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative flex items-center justify-center size-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold text-base shadow-sm shrink-0">
              SF
              <span className="absolute -top-0.5 -right-0.5 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-emerald-500 border-2 border-white dark:border-zinc-900" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Assistente Sofia
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <SparklesIcon className="size-3" />
                  Copiloto Clínico APS
                </span>
                {activeMode === "ai" && aiReport && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircleIcon className="size-3.5" /> Ativa no SOAP
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/70 mt-0.5">
                Apoio especializado na estratificação de risco, metas do Previne Brasil e RENAME.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              isLoading={isAssisting}
              radius="lg"
              size="sm"
              startContent={!isAssisting ? <SparklesIcon className="size-4" /> : undefined}
              type="button"
              onPress={() => handleAIAssist()}
            >
              {aiReport ? "Atualizar com Sofia" : "Aprimorar com Sofia"}
            </Button>
            <Button
              className="font-medium border-default-300 text-foreground"
              radius="lg"
              size="sm"
              startContent={<ClipboardDocumentCheckIcon className="size-4" />}
              type="button"
              variant="bordered"
              onPress={handleCopyFullSOAP}
            >
              Copiar para PEC
            </Button>
            <Button
              className="font-medium text-foreground/80 hover:text-foreground"
              radius="lg"
              size="sm"
              startContent={<DocumentTextIcon className="size-4" />}
              type="button"
              variant="flat"
              onPress={handleOpenModal}
            >
              Ver / Imprimir
            </Button>
          </div>
        </div>

        {/* ── Seletor de Versão (Segmented Control) ── */}
        <div className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-200/70 dark:bg-zinc-800/80 rounded-xl max-w-fit">
            <button
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeMode === "ai" && aiReport
                  ? "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              type="button"
              onClick={() => {
                if (aiReport) {
                  setActiveMode("ai");
                } else {
                  handleAIAssist();
                }
              }}
            >
              <SparklesIcon className="size-3.5 text-teal-600" />
              Versão Sofia (Aprimorada)
            </button>
            <button
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "form" || !aiReport
                  ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              type="button"
              onClick={() => setActiveMode("form")}
            >
              Dados Brutos do Formulário
            </button>
          </div>

          <p className="text-[11px] text-foreground/60 italic">
            {activeMode === "ai" && aiReport
              ? "Exibindo narrativa clínica estruturada com RENAME e metas do SUS."
              : "Exibindo valores padrão capturados diretamente das etapas 1 a 5."}
          </p>
        </div>

        {/* ── Barra Interativa: Pedir ajuste à Sofia ── */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Input
                aria-label="Pedir ajuste à Sofia"
                className="w-full text-xs"
                placeholder="Pedir ajuste à Sofia (ex: paciente relatou tontura matinal, tosse por enalapril, trocar medicação)..."
                radius="lg"
                size="sm"
                startContent={<ChatBubbleLeftRightIcon className="size-4 text-teal-600 shrink-0" />}
                value={notes}
                variant="bordered"
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAssisting) {
                    handleAIAssist();
                  }
                }}
              />
            </div>
            <Button
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs shrink-0"
              isLoading={isAssisting}
              radius="lg"
              size="sm"
              type="button"
              onPress={() => handleAIAssist()}
            >
              Refinar com Sofia
            </Button>
          </div>

          {/* Chips de sugestões rápidas */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-foreground/50 flex items-center gap-1 font-medium mr-1">
              <LightBulbIcon className="size-3" /> Sugestões:
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-foreground/75 hover:text-foreground hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700 border border-slate-200/80 dark:border-zinc-700 transition-colors"
                type="button"
                onClick={() => {
                  setNotes(chip);
                  handleAIAssist(chip);
                }}
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card de Alertas e Oportunidades Clínicas ── */}
      {activeReport.alertas_clinicos && activeReport.alertas_clinicos.length > 0 && (
        <div className="rounded-xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-lg bg-amber-500 text-white shrink-0">
                <ExclamationTriangleIcon className="size-3.5" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                Alertas e Oportunidades Clínicas Identificadas por Sofia
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              {activeReport.alertas_clinicos.length} ponto(s) de atenção
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {activeReport.alertas_clinicos.map((alerta, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-white/70 dark:bg-zinc-900/60 rounded-lg p-2.5 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200"
              >
                <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{alerta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Metadados do Paciente ── */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-foreground/50 text-xs uppercase font-medium">Paciente</p>
            <p className="font-semibold text-foreground mt-0.5">{activeReport.paciente.nome || "—"}</p>
          </div>
          <div>
            <p className="text-foreground/50 text-xs uppercase font-medium">CPF</p>
            <p className="font-semibold text-foreground mt-0.5">{activeReport.paciente.cpf || "—"}</p>
          </div>
          <div>
            <p className="text-foreground/50 text-xs uppercase font-medium">Nascimento</p>
            <p className="font-semibold text-foreground mt-0.5">
              {activeReport.paciente.nascimento || "—"}
            </p>
          </div>
          <div>
            <p className="text-foreground/50 text-xs uppercase font-medium">Idade</p>
            <p className="font-semibold text-foreground mt-0.5">
              {activeReport.paciente.idade != null
                ? `${activeReport.paciente.idade} anos`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Blocos SOAP (S, O, A, P) ── */}
      <div className="space-y-4">
        <SOAPBlock
          isSofiaEnhanced={activeMode === "ai" && Boolean(aiReport)}
          letter="S"
          sections={[
            {
              label: "Identificação e queixas principais",
              text: activeReport.subjetivo.identificacao,
            },
            {
              label: "Histórico e contexto clínico",
              text: activeReport.subjetivo.historico,
            },
            {
              label: "Determinantes sociais e psicossociais",
              text: activeReport.subjetivo.determinantes,
            },
            {
              label: "Estilo de vida e hábitos",
              text: activeReport.subjetivo.estilo_vida,
            },
          ]}
          title="Subjetivo — História clínica, queixas e contexto social"
        />

        <SOAPBlock
          isSofiaEnhanced={activeMode === "ai" && Boolean(aiReport)}
          letter="O"
          sections={[
            {
              label: "Pressão arterial (aferições e média)",
              text: activeReport.objetivo.pressao_arterial,
            },
            {
              label: "Perfil antropométrico",
              text: activeReport.objetivo.antropometria,
            },
            {
              label: "Glicemia e perfil metabólico",
              text: activeReport.objetivo.glicemia_metabolico,
            },
            {
              label: "Exame físico sumário",
              text: activeReport.objetivo.exame_fisico,
            },
          ]}
          title="Objetivo — Dados clínicos mensurados e exame físico"
        />

        <SOAPBlock
          isSofiaEnhanced={activeMode === "ai" && Boolean(aiReport)}
          letter="A"
          sections={[
            {
              label: "Hipertensão arterial e controle clínico",
              text: activeReport.avaliacao.hipertensao,
            },
            {
              label: "Diabetes mellitus e rastreio metabólico",
              text: activeReport.avaliacao.diabetes,
            },
            {
              label: "Estratificação de risco cardiovascular",
              text: activeReport.avaliacao.risco_cardiovascular,
            },
            {
              label: "Riscos psicossociais e determinantes",
              text: activeReport.avaliacao.riscos_psicossociais,
            },
            {
              label: "Outras patologias e DCNTs",
              text: activeReport.avaliacao.outras_dcnts,
            },
          ]}
          title="Avaliação — Raciocínio clínico diagnóstico e estratificação de risco"
        />

        <SOAPBlock
          isSofiaEnhanced={activeMode === "ai" && Boolean(aiReport)}
          letter="P"
          sections={[
            {
              label: "Conduta clínica e farmacologia (RENAME)",
              text: activeReport.plano.conduta_clinica,
            },
            {
              label: "Exames solicitados (Rastreio LOA no SUS)",
              text: activeReport.plano.exames_solicitados,
            },
            {
              label: "Encaminhamentos multiprofissionais e seguimento",
              text: activeReport.plano.encaminhamentos,
            },
          ]}
          title="Plano — Condutas terapêuticas, exames e agendamento na APS"
        />
      </div>

      {/* ── Indicadores do Previne Brasil ── */}
      <div className="rounded-xl border border-default-200 overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="bg-slate-800 dark:bg-slate-900 px-4 py-2.5 flex items-center justify-between">
          <h3 className="text-white font-semibold text-xs uppercase tracking-wider">
            Indicadores de Saúde da APS ativados por este SOAP
          </h3>
          <span className="text-[11px] text-slate-300">Atenção Primária / e-SUS</span>
        </div>
        <div className="divide-y divide-default-100">
          {activeReport.indicadores_previne.map((ind, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm text-foreground/90 font-medium">{ind.indicador}</span>
              <StatusBadge status={ind.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Aviso Legal CFM/COFEN ── */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/40 p-4">
        <p className="text-xs font-semibold text-foreground/80 mb-1">
          Aviso Legal &amp; Responsabilidade Técnica
        </p>
        <p className="text-xs text-foreground/60 leading-relaxed">
          {activeReport.ai_disclaimer ||
            "Documento elaborado com apoio da Assistente Sofia (Rastreia+). A responsabilidade técnica do diagnóstico, condutas e prescrições é exclusiva do profissional de saúde assistente. Revise e valide antes de colar no PEC/e-SUS."}
        </p>
      </div>

      {/* Modal do relatório completo */}
      <SOAPReportModal
        isOpen={modalOpen}
        report={activeReport}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
