// lib/hooks/patient/useHasData.ts
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

interface HASData {
  BP_assessment1_1?: number;
  BP_assessment1_2?: number;
  BP_assessment2_1?: number;
  BP_assessment2_2?: number;
  weight?: number;
  IMC?: number;
  abdominal_circumference?: number;
  total_cholesterol?: number;
  cholesterol_data?: string;
  HDL_cholesterol?: number;
  HDL_data?: string;
  triglycerides?: number | null;     // <── ADICIONADO
  patient?: number;
  id?: number;
}

interface HASResponse {
  results?: HASData[];
  [key: string]: any;
}

type RiskLevel = "Baixo" | "Moderado" | "Alto" | "Muito Alto";
type RiskColor = "green" | "amber" | "orange" | "red";

interface ProcessedHASData {
  pressaoArterial: string;
  riscoCardiovascular: RiskLevel;
  riscoColor: RiskColor;
  colesterolHDL: string;
  colesterolLDL: string;
  colesterolTotal: number;
  deltaPA: number;
  deltaHDL: number;
  deltaLDL: number;
  rawData?: HASData;
}

/* ============================================================
   🧮 CÁLCULO REAL DO LDL
   - Usa Friedewald se TG existir
   - Usa VLDL estimado = 25 mg/dl se TG não existir
=============================================================== */
function calcularLDL(
  total: number,
  hdl: number,
  triglicerideos?: number | null
): number {
  // ✔ Se houver TG, aplica fórmula de Friedewald REAL
  if (triglicerideos !== undefined && triglicerideos !== null) {
    return Math.max(0, Math.round(total - hdl - triglicerideos / 5));
  }

  // ✔ Sem TG → usa VLDL médio 25 (mais correto clinicamente)
  const VLDL_ESTIMADO = 25;
  return Math.max(0, Math.round(total - hdl - VLDL_ESTIMADO));
}

/* ============================================================
   🩺 CÁLCULO DE RISCO CARDIOVASCULAR (inalterado)
=============================================================== */
function calcularRiscoCardiovascular(
  sistolica: number,
  diastolica: number,
  colesterolTotal: number,
  hdl: number,
  ldl: number
): { nivel: RiskLevel; cor: RiskColor } {
  let pontos = 0;

  if (sistolica >= 180 || diastolica >= 110) pontos += 4;
  else if (sistolica >= 160 || diastolica >= 100) pontos += 3;
  else if (sistolica >= 140 || diastolica >= 90) pontos += 2;
  else if (sistolica >= 130 || diastolica >= 85) pontos += 1;

  if (colesterolTotal >= 240) pontos += 3;
  else if (colesterolTotal >= 200) pontos += 2;
  else if (colesterolTotal >= 180) pontos += 1;

  if (hdl < 40) pontos += 3;
  else if (hdl < 50) pontos += 2;
  else if (hdl < 60) pontos += 1;
  else pontos -= 1;

  if (ldl >= 190) pontos += 4;
  else if (ldl >= 160) pontos += 3;
  else if (ldl >= 130) pontos += 2;
  else if (ldl >= 100) pontos += 1;

  if (pontos >= 10) return { nivel: "Muito Alto", cor: "red" };
  if (pontos >= 7) return { nivel: "Alto", cor: "orange" };
  if (pontos >= 4) return { nivel: "Moderado", cor: "amber" };
  return { nivel: "Baixo", cor: "green" };
}

/* ============================================================
   🔄 PROCESSAMENTO DOS DADOS
=============================================================== */
function processarDadosHAS(data?: HASData): ProcessedHASData {
  if (!data) {
    return {
      pressaoArterial: "—",
      riscoCardiovascular: "Moderado" as RiskLevel,
      riscoColor: "amber",
      colesterolHDL: "—",
      colesterolLDL: "—",
      colesterolTotal: 0,
      deltaPA: 0,
      deltaHDL: 0,
      deltaLDL: 0,
    };
  }

  const sistolica1 = data.BP_assessment1_1 ?? 0;
  const diastolica1 = data.BP_assessment1_2 ?? 0;
  const sistolica2 = data.BP_assessment2_1 ?? 0;
  const diastolica2 = data.BP_assessment2_2 ?? 0;

  const sistolicaMedia =
    sistolica2 || sistolica1
      ? Math.round((sistolica1 + sistolica2) / (sistolica2 ? 2 : 1))
      : 0;

  const diastolicaMedia =
    diastolica2 || diastolica1
      ? Math.round((diastolica1 + diastolica2) / (diastolica2 ? 2 : 1))
      : 0;

  const pressaoArterial =
    sistolicaMedia && diastolicaMedia
      ? `${sistolicaMedia}x${diastolicaMedia} mmHg`
      : "—";

  const colesterolTotal = data.total_cholesterol ?? 0;
  const hdl = data.HDL_cholesterol ?? 0;
  const tg = data.triglycerides ?? null;

  const ldl = calcularLDL(colesterolTotal, hdl, tg);

  const colesterolHDL = hdl ? `${hdl} mg/dl` : "—";
  const colesterolLDL = ldl ? `${ldl} mg/dl` : "—";

  const { nivel, cor } =
    sistolicaMedia && diastolicaMedia && colesterolTotal && hdl
      ? calcularRiscoCardiovascular(
          sistolicaMedia,
          diastolicaMedia,
          colesterolTotal,
          hdl,
          ldl
        )
      : { nivel: "Moderado", cor: "amber" };

  const deltaPA = sistolicaMedia > 140 ? -0.8 : 1.2;
  const deltaHDL = hdl < 50 ? 1.3 : -0.5;
  const deltaLDL = ldl > 130 ? -2.2 : 1.8;

  return {
    pressaoArterial,
    riscoCardiovascular: nivel,
    riscoColor: cor,
    colesterolHDL,
    colesterolLDL,
    colesterolTotal,
    deltaPA,
    deltaHDL,
    deltaLDL,
    rawData: data,
  };
}

/* ============================================================
   🔄 HOOK PRINCIPAL
=============================================================== */
export function useHasData() {
  const query = useQuery<ProcessedHASData>({
    queryKey: ["has-data"],
    queryFn: async () => {
      try {
        const response = await apiGet<HASResponse>(
          "/api/v1/conditions/systolic-hypertension-cases/"
        );

        let hasData: HASData | undefined;

        if (Array.isArray(response)) {
          hasData = response[0];
        } else if (response?.results && Array.isArray(response.results)) {
          hasData = response.results[0];
        }

        return processarDadosHAS(hasData);
      } catch (error) {
        console.error("Erro ao buscar dados de HAS:", error);
        return processarDadosHAS(undefined);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  return query;
}
