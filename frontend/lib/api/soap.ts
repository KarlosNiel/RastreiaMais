// frontend/lib/api/soap.ts
import { apiPost } from "@/lib/api";

export type SOAPIndicador = {
  indicador: string;
  status: "ATINGIDO" | "EM CURSO" | "PENDENTE";
};

export type SOAPPaciente = {
  id: number;
  nome: string;
  cpf: string | null;
  nascimento: string | null;
  idade: number | null;
};

export type SOAPSubjetivo = {
  identificacao: string;
  historico: string;
  determinantes: string;
  estilo_vida: string;
};

export type SOAPObjetivo = {
  pressao_arterial?: string | null;
  antropometria?: string | null;
  glicemia_metabolico?: string | null;
  exame_fisico?: string | null;
};

export type SOAPAvaliacao = {
  hipertensao?: string | null;
  diabetes?: string | null;
  risco_cardiovascular?: string | null;
  riscos_psicossociais?: string | null;
  outras_dcnts?: string | null;
};

export type SOAPPlano = {
  conduta_clinica?: string | null;
  exames_solicitados?: string | null;
  encaminhamentos?: string | null;
};

export type SOAPReport = {
  paciente: SOAPPaciente;
  subjetivo: SOAPSubjetivo;
  objetivo: SOAPObjetivo;
  avaliacao: SOAPAvaliacao;
  plano: SOAPPlano;
  indicadores_previne: SOAPIndicador[];
  gerado_em: string;
  alertas_clinicos?: string[];
  sugestoes_conduta?: string[];
  is_ai_enhanced?: boolean;
  ai_disclaimer?: string | null;
};

/**
 * Gera o relatório SOAP para um paciente já salvo no backend.
 */
export async function generateSOAPReport(
  patientId: number,
): Promise<SOAPReport | null> {
  return apiPost<SOAPReport>("/api/v1/reports/soap/generate/", {
    patient_id: patientId,
  });
}

/**
 * Aprimora o relatório SOAP utilizando a API Gemini com Function Calling
 * (diretrizes clínicas da APS, RENAME e Previne Brasil).
 */
export async function assistSOAPReport(params: {
  patientId?: number;
  baseSoap?: SOAPReport;
  professionalNotes?: string;
}): Promise<SOAPReport | null> {
  return apiPost<SOAPReport>("/api/v1/reports/soap/assist/", {
    patient_id: params.patientId,
    base_soap: params.baseSoap,
    professional_notes: params.professionalNotes,
  });
}
