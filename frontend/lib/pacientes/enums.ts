// frontend/lib/pacientes/enums.ts

/**
 * Mapa genérico para choices front ↔ back.
 * Mantemos Record<string, string> para simplicidade.
 */
type ChoiceMap = Record<string, string>;

function invertMap(map: ChoiceMap): ChoiceMap {
  return Object.fromEntries(
    Object.entries(map).map(([front, back]) => [back, front])
  );
}

/** ─────────────────────────────────────────────────────────────
 *  Sociodemográficos
 *  ──────────────────────────────────────────────────────────── */

export const civilStatusMap: ChoiceMap = {
  solteiro: "SOLTEIRO",
  casado: "CASADO",
  uniao_estavel: "UNIAO_ESTAVEL",
  viuvo: "VIUVO",
  separado: "SEPARADO",
};

export const civilStatusBackToFront: ChoiceMap = invertMap(civilStatusMap);

export const scholarityMap: ChoiceMap = {
  sem_escolaridade: "ANALFABETO",
  fund_incompleto: "FUND_INCOMPL",
  fund_completo: "FUND_COMPL",
  medio_incompleto: "MED_INCOMPL",
  medio_completo: "MED_COMPL",
  sup_incompleto: "SUP_INCOMPL",
  sup_completo: "SUP_COMPL",
};

export const scholarityBackToFront: ChoiceMap = invertMap(scholarityMap);

/** ─────────────────────────────────────────────────────────────
 *  Tratamento / yes-no-maybe (HAS / DM)
 *  ──────────────────────────────────────────────────────────── */

export const treatmentStatusMap: ChoiceMap = {
  sim: "SIM",
  nao: "NAO",
  irregular: "IRREGULAR",
  nao_se_aplica: "NAO_SE_APLICA",
};

export const treatmentStatusBackToFront: ChoiceMap = {
  SIM: "sim",
  NAO: "nao",
  IRREGULAR: "irregular",
  NAO_SE_APLICA: "nao_se_aplica",
};

/** ─────────────────────────────────────────────────────────────
 *  HAS — Classificação PA / Framingham / Conduta / Complicações
 *  ──────────────────────────────────────────────────────────── */

export const bpClassificationMap: ChoiceMap = {
  normal: "NORMAL",
  pre_hipertenso: "PRE_HIPERTENSO",
  estagio1: "HIPERTENSO_E1",
  estagio2: "HIPERTENSO_E2",
  estagio3: "HIPERTENSO_E3",
};

export const bpClassificationBackToFront: ChoiceMap =
  invertMap(bpClassificationMap);

export const framinghamMap: ChoiceMap = {
  "<10": "BAIXO",
  "10-20": "MODERADO",
  ">20": "ALTO",
};

export const framinghamBackToFront: ChoiceMap = invertMap(framinghamMap);

// Conduta adotada (HAS)
export const conductHasMap: ChoiceMap = {
  aps: "ACOMPANHAMENTO_APS",
  encaminhamento: "ENCAMINHAMENTO_MEDICO",
  grupo: "ACONSELHAMENTO_GRUPO",
  // "outro" não tem equivalente no backend (não há campo texto livre)
};

export const conductHasBackToFront: ChoiceMap = {
  ACOMPANHAMENTO_APS: "aps",
  ENCAMINHAMENTO_MEDICO: "encaminhamento",
  ACONSELHAMENTO_GRUPO: "grupo",
};

export const hasComplicationsMap: ChoiceMap = {
  avc: "AVC",
  infarto: "INFARTO",
  renal: "DOENCA_RENAL",
};

export const hasComplicationsBackToFront: ChoiceMap = {
  AVC: "avc",
  INFARTO: "infarto",
  DOENCA_RENAL: "renal",
};

/** ─────────────────────────────────────────────────────────────
 *  Estilo de Vida (LifeStyle em PatientUser)
 *  ──────────────────────────────────────────────────────────── */

export const feedingMap: ChoiceMap = {
  saudavel: "SAUDAVEL",
  parcial: "PARCIALMENTE",
  pouco: "POUCO",
};

export const feedingBackToFront: ChoiceMap = invertMap(feedingMap);

export const saltConsumptionMap: ChoiceMap = {
  adequado: "ADEQUADO",
  exagerado: "EXAGERADO",
  nao_sabe: "NAO_SABE",
};

export const saltConsumptionBackToFront: ChoiceMap =
  invertMap(saltConsumptionMap);

export const alcoholConsumptionMap: ChoiceMap = {
  nao_bebe: "NAO_BEBE",
  socialmente: "SOCIALMENTE",
  frequentemente: "FREQUENTEMENTE",
};

export const alcoholConsumptionBackToFront: ChoiceMap = invertMap(
  alcoholConsumptionMap
);

export const smokingMap: ChoiceMap = {
  nunca: "NUNCA_FUMOU",
  ex: "EX_FUMANTE",
  atual: "FUMANTE_ATUAL",
};

export const smokingBackToFront: ChoiceMap = invertMap(smokingMap);

/** ─────────────────────────────────────────────────────────────
 *  Última consulta (HAS / DM) → LastCheckChoices
 *  ──────────────────────────────────────────────────────────── */

export const lastConsultationMap: ChoiceMap = {
  "7d": "7_DIAS",
  "15d": "15_DIAS",
  "30d": "30_DIAS",
  "60d": "60_DIAS",
  "90d": "90_DIAS",
  "6m": "6_MESES",
  "1a": "1_ANO",
  ">1a": "MAIS_DE_1_ANO",
};

export const lastConsultationBackToFront: ChoiceMap =
  invertMap(lastConsultationMap);
