// frontend/components/pacientes/sections/Step6Resumo.tsx
"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import SOAPReportModal from "@/components/pacientes/SOAPReportModal";
import { notifySuccess, notifyWarn } from "@/components/ui/notify";
import type { SOAPReport } from "@/lib/api/soap";

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

  const nonEmpty = sections.filter((s) => s.text);
  if (nonEmpty.length === 0) return null;

  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      <div
        className={`${colors.header} px-4 py-2.5 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-lg">
            {letter}
          </span>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        <button
          className="text-white/80 hover:text-white text-xs underline transition-colors"
          type="button"
          onClick={copyBlock}
        >
          Copiar bloco
        </button>
      </div>

      <div className={`${colors.bg}`}>
        {nonEmpty.map((s, i) => (
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

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    ATINGIDO:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    "EM CURSO":
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    PENDENTE:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
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

  /* ── Extrai dados do formulário ── */
  const buildSOAPFromForm = useCallback((): SOAPReport => {
    const vals = getValues();
    const socio = vals.socio ?? {};
    const cond = vals.condicoes ?? {};
    const hasData = vals.clinica?.has;
    const dmData = vals.clinica?.dm;
    const multiprof = vals.multiprof ?? {};
    const plano = vals.plano ?? {};

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
        paParts.push(
          `1ª aferição: ${hasData.pa1_sis}/${hasData.pa1_dia} mmHg`,
        );
      }
      if (hasData.pa2_sis && hasData.pa2_dia) {
        paParts.push(
          `2ª aferição: ${hasData.pa2_sis}/${hasData.pa2_dia} mmHg`,
        );
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
      if (dmData.hba1c) gParts.push(`Hemoglobina glicada (HbA1c): ${dmData.hba1c}%`);
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
        const screening =
          SCREENING_MAP[dmData.triagem_dm ?? ""] ?? "";
        diabetes = screening
          ? `Triagem: ${screening}.`
          : "Sem alterações glicêmicas identificadas na triagem.";
      }
    }

    let riscoCv: string | null = null;
    if (hasData?.framingham) {
      const framLabel = FRAMINGHAM_MAP[hasData.framingham] ?? hasData.framingham;
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
    if (multiprof.precisa_enc_multiprof === "sim" && multiprof.enc_multiprof?.length) {
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
        status: (cond.has || cond.dm
          ? "ATINGIDO"
          : "PENDENTE") as "ATINGIDO" | "PENDENTE",
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
      subjetivo: { identificacao, historico, determinantes, estilo_vida: estiloVida },
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
  const report = useMemo(() => buildSOAPFromForm(), [buildSOAPFromForm]);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <Card
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
        shadow="none"
      >
        <CardBody className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">6. Resumo SOAP</h2>
            <Button
              className="bg-orange-600 hover:bg-orange-500 text-white"
              radius="full"
              type="button"
              onPress={handleOpenModal}
            >
              📋 Gerar Relatório SOAP
            </Button>
          </div>

          <p className="text-sm text-foreground/60">
            Visualize o resumo da avaliação no formato SOAP antes de finalizar.
            Use os botões &quot;Copiar bloco&quot; para colar diretamente no PEC/e-SUS.
          </p>

          {/* Paciente info */}
          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
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

          {/* SOAP Blocks */}
          <div className="space-y-5">
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
                {
                  label: "Estilo de vida",
                  text: report.subjetivo.estilo_vida,
                },
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
          </div>

          {/* Indicadores do Previne Brasil */}
          <div className="rounded-lg border border-default-200 overflow-hidden">
            <div className="bg-gray-700 dark:bg-gray-800 px-4 py-2.5">
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

          {/* Info note */}
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
              Importante
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              O SOAP gerado pelo RASTREIA+ é um rascunho estruturado, não um
              texto definitivo. O profissional de saúde é responsável por revisar
              e validar o conteúdo antes de colar no PEC. Informações clínicas
              devem ser conferidas com os dados reais do paciente no momento do
              atendimento.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Modal do relatório completo */}
      <SOAPReportModal
        isOpen={modalOpen}
        report={report}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
