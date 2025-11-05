// frontend/lib/pacientes/mappers.ts
import type {
  RegistroPacienteCreate,
  RegistroPacienteEdit,
} from "@/schemas/paciente";

/** ─────────────────────────────────────────────────────────────
 *  Maps de enum (front → back)
 *  ──────────────────────────────────────────────────────────── */
const civilStatusMap: Record<string, string> = {
  solteiro: "SOLTEIRO",
  casado: "CASADO",
  uniao_estavel: "UNIAO_ESTAVEL",
  viuvo: "VIUVO",
  separado: "SEPARADO",
};

const scholarityMap: Record<string, string> = {
  sem_escolaridade: "ANALFABETO",
  fund_incompleto: "FUND_INCOMPL",
  fund_completo: "FUND_COMPL",
  medio_incompleto: "MED_INCOMPL",
  medio_completo: "MED_COMPL",
  sup_incompleto: "SUP_INCOMPL",
  sup_completo: "SUP_COMPL",
};

// inversos (back → front) para preencher o form na edição
const civilStatusBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(civilStatusMap).map(([front, back]) => [back, front])
);

const scholarityBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(scholarityMap).map(([front, back]) => [back, front])
);

/** Tratamento / yes-no-maybe para HAS/DM */
const treatmentStatusMap: Record<string, string> = {
  sim: "SIM",
  nao: "NAO",
  irregular: "IRREGULAR",
  nao_se_aplica: "NAO_SE_APLICA",
};

const treatmentStatusBackToFront: Record<string, string> = {
  SIM: "sim",
  NAO: "nao",
  IRREGULAR: "irregular",
  NAO_SE_APLICA: "nao_se_aplica",
};

function yesNoMaybeToBool(v?: string | null): boolean | null {
  if (!v) return null;
  if (v === "sim") return true;
  if (v === "nao") return false;
  return null;
}

function boolToYesNoMaybe(
  b?: boolean | null
): "sim" | "nao" | "nao_sabe" | undefined {
  if (b === true) return "sim";
  if (b === false) return "nao";
  return "nao_sabe";
}

/** Utilidades simples */
function onlyDigits(s?: string | null) {
  return (s ?? "").replace(/\D+/g, "");
}

function toDateISO(d?: Date | string | null) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return null;
  // ISO yyyy-mm-dd (sem timezone)
  return dt.toISOString().slice(0, 10);
}

/** Tipo do payload que o back espera (mínimo para paciente) */
export type PatientApiPayload = {
  // nested user - SOMENTE no create
  user?: {
    username: string;
    first_name: string;
    last_name: string;
    /** opcional; se ausente, backend aceita normalmente */
    email?: string;
    password: string;
  };
  // SocialdemographicData
  cpf?: string | null;
  birth_date?: string | null; // "YYYY-MM-DD"
  gender?: string | null;
  race_ethnicity?: string | null;
  scholarity?: string | null; // enum
  occupation?: string | null;
  civil_status?: string | null; // enum
  people_per_household?: number | null;
  family_responsability?: string | null;
  family_income?: string | null; // decimal como string
  bolsa_familia?: boolean | null;
  micro_area?: number | null; // FK id
  address?: number | null; // OneToOne id
  phone?: string | null;
  whatsapp?: boolean | null;
};

/** Payloads mínimos para HAS/DM */
export type HasApiPayload = {
  patient: number;
  is_diagnosed?: boolean | null;
  uses_medication?: "SIM" | "NAO" | "IRREGULAR" | "NAO_SE_APLICA" | null;

  BP_assessment1_1?: number | null;
  BP_assessment1_2?: number | null;
  BP_assessment2_1?: number | null;
  BP_assessment2_2?: number | null;
  weight?: string | null;
  IMC?: string | null;
  abdominal_circumference?: string | null;
};

export type DmApiPayload = {
  patient: number;
  is_diagnosed?: boolean | null;
  uses_medication?: "SIM" | "NAO" | "IRREGULAR" | "NAO_SE_APLICA" | null;

  capillary_blood_glucose_random?: string | null;
  fasting_capillary_blood_glucose?: string | null;
  glycated_hemoglobin?: string | null;
};

/** FRONT (form) → BACK (Patient API)
 *  mode: "create" envia user; "edit" não envia user.
 */
export function formToPatientApi(
  data: RegistroPacienteCreate | RegistroPacienteEdit,
  mode: "create" | "edit"
): PatientApiPayload {
  const socio: any = (data as any).socio ?? {};

  // nome → quebra simples em first_name / last_name
  const nome: string = socio?.nome?.trim?.() ?? "";
  const [first_name, ...rest] = nome.split(/\s+/);
  const last_name = rest.join(" ");

  // e-mail: campo opcional no form
  const rawEmail = socio?.email?.trim?.();
  const hasEmail = !!rawEmail;

  // montar user apenas no create
  const user =
    mode === "create"
      ? {
          username:
            socio?.username ??
            (onlyDigits(socio?.sus_cpf) ||
              first_name?.toLowerCase() ||
              "paciente"),
          first_name: first_name || "Paciente",
          last_name: last_name || "",
          ...(hasEmail ? { email: rawEmail } : {}), // ⬅️ não mandamos email se estiver vazio
          // regra simples: se não tiver senha no form, gera default
          password: socio?.password || socio?.senha || "Mudar123!",
        }
      : undefined;

  const renda =
    typeof socio?.renda_familiar === "number"
      ? socio.renda_familiar.toFixed(2)
      : socio?.renda_familiar != null
        ? String(socio.renda_familiar)
        : null;

  const payload: PatientApiPayload = {
    ...(user ? { user } : {}),

    // SocialdemographicData
    cpf: onlyDigits(socio?.sus_cpf) || null,
    birth_date: toDateISO(socio?.nascimento),
    gender: socio?.genero || null,
    race_ethnicity: socio?.raca_etnia || null,
    scholarity: socio?.escolaridade
      ? (scholarityMap[socio.escolaridade] ?? null)
      : null,
    occupation: socio?.ocupacao || null,
    civil_status: socio?.estado_civil
      ? (civilStatusMap[socio.estado_civil] ?? null)
      : null,
    people_per_household: socio?.n_pessoas_domicilio ?? null,
    family_responsability: socio?.responsavel_familiar || null,
    family_income: renda,
    bolsa_familia:
      typeof socio?.bolsa_familia === "boolean" ? socio.bolsa_familia : null,
    // micro_area/address ainda não existem no form – mantemos null por enquanto
    micro_area: null,
    address: null,
    phone: onlyDigits(socio?.telefone) || null,
    whatsapp: typeof socio?.whatsapp === "boolean" ? socio.whatsapp : null,
  };

  return payload;
}

/** BACK (Patient API) → FRONT (form defaultValues)
 *  Preenche apenas o que o step SOCIO usa.
 *  O resto dos steps fica com defaults “em branco”.
 */
export function patientApiToForm(api: any): RegistroPacienteCreate {
  const socio: any = {};

  // user
  const user = api?.user ?? {};
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  // SocialdemographicData
  socio.nome = fullName || "";
  socio.sus_cpf = api?.cpf ?? "";
  socio.nascimento = api?.birth_date ?? null; // string yyyy-mm-dd ou null
  socio.genero = api?.gender ?? "M";
  socio.genero_outro = "";
  socio.raca_etnia = api?.race_ethnicity ?? "nao_informado";

  socio.telefone = api?.phone ?? "";
  socio.whatsapp = api?.whatsapp ?? false;

  socio.endereco = {
    logradouro: "",
    bairro: "",
    cidade: "",
    uf: "PB",
    cep: "",
  };

  socio.n_pessoas_domicilio = api?.people_per_household ?? undefined;
  socio.responsavel_familiar = api?.family_responsability ?? "";
  socio.renda_familiar = api?.family_income ?? undefined;
  socio.bolsa_familia = api?.bolsa_familia ?? false;

  socio.escolaridade = api?.scholarity
    ? (scholarityBackToFront[api.scholarity] ?? "sem_escolaridade")
    : "sem_escolaridade";

  socio.ocupacao = api?.occupation ?? "";

  socio.estado_civil = api?.civil_status
    ? (civilStatusBackToFront[api.civil_status] ?? "solteiro")
    : "solteiro";

  // Shape mínimo compatível com RegistroPacienteCreateZ
  return {
    socio,
    condicoes: {
      has: false,
      dm: false,
      outras_dcnts: "",
      outras_em_acompanhamento: undefined,
    },
    clinica: {
      has: undefined,
      dm: undefined,
    } as any,
    multiprof: undefined as any,
    plano: undefined as any,
  };
}

/** FRONT → HAS API (create/edit) */
export function formToHasApi(
  data: RegistroPacienteCreate | RegistroPacienteEdit,
  patientId: number
): HasApiPayload | null {
  const cond: any = (data as any).condicoes;
  const has: any = (data as any).clinica?.has;

  // se não marcou HAS e não preencheu bloco, não cria/atualiza registro
  if (!cond?.has && !has) return null;

  return {
    patient: patientId,
    is_diagnosed: yesNoMaybeToBool(has?.diag_has),
    uses_medication: has?.usa_medicacao
      ? (treatmentStatusMap[
          has.usa_medicacao
        ] as HasApiPayload["uses_medication"])
      : null,
    BP_assessment1_1: has?.pa1_sis ?? null,
    BP_assessment1_2: has?.pa1_dia ?? null,
    BP_assessment2_1: has?.pa2_sis ?? null,
    BP_assessment2_2: has?.pa2_dia ?? null,
    weight:
      typeof has?.peso === "number" ? has.peso.toFixed(2) : (has?.peso ?? null),
    IMC: typeof has?.imc === "number" ? has.imc.toFixed(2) : (has?.imc ?? null),
    abdominal_circumference:
      typeof has?.circ_abdominal === "number"
        ? has.circ_abdominal.toFixed(2)
        : (has?.circ_abdominal ?? null),
  };
}

/** FRONT → DM API (create/edit) */
export function formToDmApi(
  data: RegistroPacienteCreate | RegistroPacienteEdit,
  patientId: number
): DmApiPayload | null {
  const cond: any = (data as any).condicoes;
  const dm: any = (data as any).clinica?.dm;

  if (!cond?.dm && !dm) return null;

  return {
    patient: patientId,
    is_diagnosed: yesNoMaybeToBool(dm?.diag_dm),
    uses_medication: dm?.usa_medicacao
      ? (treatmentStatusMap[
          dm.usa_medicacao
        ] as DmApiPayload["uses_medication"])
      : null,
    capillary_blood_glucose_random: dm?.glicemia_aleatoria
      ? String(dm.glicemia_aleatoria)
      : null,
    fasting_capillary_blood_glucose: dm?.glicemia_jejum
      ? String(dm.glicemia_jejum)
      : null,
    glycated_hemoglobin: dm?.hba1c ? String(dm.hba1c) : null,
  };
}

/** BACK (HAS API) → FRONT (clinica.has) */
export function hasApiToForm(api: any): any {
  if (!api) return undefined;

  return {
    diag_has: boolToYesNoMaybe(api.is_diagnosed),
    usa_medicacao: api.uses_medication
      ? (treatmentStatusBackToFront[api.uses_medication] ?? "nao_se_aplica")
      : "nao_se_aplica",
    pa1_sis: api.BP_assessment1_1 ?? undefined,
    pa1_dia: api.BP_assessment1_2 ?? undefined,
    pa2_sis: api.BP_assessment2_1 ?? undefined,
    pa2_dia: api.BP_assessment2_2 ?? undefined,
    peso:
      api.weight != null && api.weight !== "" ? Number(api.weight) : undefined,
    imc: api.IMC != null && api.IMC !== "" ? Number(api.IMC) : undefined,
    circ_abdominal:
      api.abdominal_circumference != null && api.abdominal_circumference !== ""
        ? Number(api.abdominal_circumference)
        : undefined,
  };
}

/** BACK (DM API) → FRONT (clinica.dm) */
export function dmApiToForm(api: any): any {
  if (!api) return undefined;

  return {
    diag_dm: boolToYesNoMaybe(api.is_diagnosed),
    usa_medicacao: api.uses_medication
      ? (treatmentStatusBackToFront[api.uses_medication] ?? "nao_se_aplica")
      : "nao_se_aplica",
    glicemia_aleatoria:
      api.capillary_blood_glucose_random != null &&
      api.capillary_blood_glucose_random !== ""
        ? Number(api.capillary_blood_glucose_random)
        : undefined,
    glicemia_jejum:
      api.fasting_capillary_blood_glucose != null &&
      api.fasting_capillary_blood_glucose !== ""
        ? Number(api.fasting_capillary_blood_glucose)
        : undefined,
    hba1c:
      api.glycated_hemoglobin != null && api.glycated_hemoglobin !== ""
        ? Number(api.glycated_hemoglobin)
        : undefined,
  };
}
