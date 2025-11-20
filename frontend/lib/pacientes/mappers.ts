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

/** ─────────────────────────────────────────────────────────────
 *  HAS — Classificação PA / Framingham / Conduta
 *  ──────────────────────────────────────────────────────────── */

// front → back (choices do backend)
const bpClassificationMap: Record<string, string> = {
  normal: "NORMAL",
  pre_hipertenso: "PRE_HIPERTENSO",
  estagio1: "HIPERTENSO_E1",
  estagio2: "HIPERTENSO_E2",
  estagio3: "HIPERTENSO_E3",
};

const bpClassificationBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(bpClassificationMap).map(([front, back]) => [back, front])
);

const framinghamMap: Record<string, string> = {
  "<10": "BAIXO",
  "10-20": "MODERADO",
  ">20": "ALTO",
};

const framinghamBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(framinghamMap).map(([front, back]) => [back, front])
);

// Conduta adotada (HAS)
const conductHasMap: Record<string, string> = {
  aps: "ACOMPANHAMENTO_APS",
  encaminhamento: "ENCAMINHAMENTO_MEDICO",
  grupo: "ACONSELHAMENTO_GRUPO",
  // "outro" não tem equivalente no backend (não há campo texto livre)
};

const conductHasBackToFront: Record<string, string> = {
  ACOMPANHAMENTO_APS: "aps",
  ENCAMINHAMENTO_MEDICO: "encaminhamento",
  ACONSELHAMENTO_GRUPO: "grupo",
};

const hasComplicationsMap: Record<string, string> = {
  avc: "AVC",
  infarto: "INFARTO",
  renal: "DOENCA_RENAL",
};

const hasComplicationsBackToFront: Record<string, string> = {
  AVC: "avc",
  INFARTO: "infarto",
  DOENCA_RENAL: "renal",
};

/** ─────────────────────────────────────────────────────────────
 *  Estilo de Vida (LifeStyle em PatientUser)
 *  ──────────────────────────────────────────────────────────── */

const feedingMap: Record<string, string> = {
  saudavel: "SAUDAVEL",
  parcial: "PARCIALMENTE",
  pouco: "POUCO",
};

const feedingBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(feedingMap).map(([front, back]) => [back, front])
);

const saltConsumptionMap: Record<string, string> = {
  adequado: "ADEQUADO",
  exagerado: "EXAGERADO",
  nao_sabe: "NAO_SABE",
};

const saltConsumptionBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(saltConsumptionMap).map(([front, back]) => [back, front])
);

const alcoholConsumptionMap: Record<string, string> = {
  nao_bebe: "NAO_BEBE",
  socialmente: "SOCIALMENTE",
  frequentemente: "FREQUENTEMENTE",
};

const alcoholConsumptionBackToFront: Record<string, string> =
  Object.fromEntries(
    Object.entries(alcoholConsumptionMap).map(([front, back]) => [back, front])
  );

const smokingMap: Record<string, string> = {
  nunca: "NUNCA_FUMOU",
  ex: "EX_FUMANTE",
  atual: "FUMANTE_ATUAL",
};

const smokingBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(smokingMap).map(([front, back]) => [back, front])
);

// ultima_consulta_has / ultima_consulta_dm → LastCheckChoices
const lastConsultationMap: Record<string, string> = {
  "7d": "7_DIAS",
  "15d": "15_DIAS",
  "30d": "30_DIAS",
  "60d": "60_DIAS",
  "90d": "90_DIAS",
  "6m": "6_MESES",
  "1a": "1_ANO",
  ">1a": "MAIS_DE_1_ANO",
};

const lastConsultationBackToFront: Record<string, string> = Object.fromEntries(
  Object.entries(lastConsultationMap).map(([front, back]) => [back, front])
);

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

// Gera senha no formato: LLDDDDD# (2 letras + 5 dígitos + símbolo)
// Ex.: "ba27412#", "de59023#", "li83704#", "so19485#"
const PASSWORD_SYMBOL = "#";
const PASSWORD_DIGITS = 5;

export function generateSimplePassword(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";

  // 2 letras + N dígitos
  const totalRandomSlots = 2 + PASSWORD_DIGITS;

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint32Array(totalRandomSlots);
    window.crypto.getRandomValues(array);

    const l1 = letters[array[0] % letters.length];
    const l2 = letters[array[1] % letters.length];

    let numPart = "";
    for (let i = 2; i < totalRandomSlots; i++) {
      numPart += digits[array[i] % digits.length];
    }

    return `${l1}${l2}${numPart}${PASSWORD_SYMBOL}`;
  }

  // fallback: Math.random
  const randIndex = (max: number) => Math.floor(Math.random() * max);

  const l1 = letters[randIndex(letters.length)];
  const l2 = letters[randIndex(letters.length)];

  let numPart = "";
  for (let i = 0; i < PASSWORD_DIGITS; i++) {
    numPart += digits[randIndex(digits.length)];
  }

  return `${l1}${l2}${numPart}${PASSWORD_SYMBOL}`;
}

function toDateISO(d?: Date | string | null) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return null;
  // ISO yyyy-mm-dd (sem timezone)
  return dt.toISOString().slice(0, 10);
}

function calcAgeFromBirth(d?: Date | string | null): number | null {
  if (!d) return null;

  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - dt.getFullYear();
  const m = now.getMonth() - dt.getMonth();

  if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) {
    years--;
  }

  return years >= 0 ? years : 0;
}

/** ─────────────────────────────────────────────────────────────
 * Helpers para campos opcionais (evitar "valores inventados")
 * ───────────────────────────────────────────────────────────── */
function optString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s === "" ? undefined : s;
}

function nullableBool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
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
  age?: number | null;
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

  // PsychosocialRisks
  use_psychotropic_medication?: boolean | null;
  use_psychotropic_medication_answer?: string | null;
  any_psychological_psychiatric_diagnosis?: boolean | null;
  any_psychological_psychiatric_diagnosis_answer?: string | null;
  everyday_stress_interfere_with_your_BP_BS_control?: boolean | null;
  economic_factors_interfere_with_your_treatment?: boolean | null;
  feel_receive_support_from_family_friends_to_maintain_treatment?:
    | boolean
    | null;
  regularly_follow_health_guidelines?: boolean | null;

  // EnvironmentalRisks
  presence_of_pets_at_home?: boolean | null;
  presence_of_pets_at_home_answer?: string | null;
  your_animals_are_vaccinated?: boolean | null;
  delayed_wound_healing_after_scratches_or_bites?: boolean | null;
  diagnosed_transmissible_disease_in_household?: string | null;
  direct_contact_with_animal_bodily_fluids?: string | null;
  received_guidance_on_zoonoses?: boolean | null;

  // PhysicalMotorRisks
  performs_physical_activity?: boolean | null;
  performs_physical_activity_answer?: string | null;
  has_edema?: boolean | null;
  has_dyspnea?: boolean | null;
  has_paresthesia_or_cramps?: boolean | null;
  has_difficulty_walking_or_activity?: boolean | null;

  // LifeStyle (apps.accounts.data.patient.LifeStyle)
  feed?: string | null;
  salt_consumption?: string | null;
  alcohol_consumption?: string | null;
  smoking?: string | null;
  last_consultation?: string | null;

  // ClassificationConducmMultiProfessional
  requires_multidisciplinary_referral?: boolean | null;
  requires_multidisciplinary_referral_choose?: string | null;
};

/** Payloads mínimos para HAS/DM */
export type HasApiPayload = {
  patient: number;
  is_diagnosed?: boolean | null;
  uses_medication?: "SIM" | "NAO" | "IRREGULAR" | "NAO_SE_APLICA" | null;
  family_history?: boolean | null;
  BP_assessment1_1?: number | null;
  BP_assessment1_2?: number | null;
  BP_assessment2_1?: number | null;
  BP_assessment2_2?: number | null;
  weight?: string | null;
  height?: string | null;
  IMC?: string | null;
  abdominal_circumference?: string | null;
  total_cholesterol?: number | null;
  cholesterol_data?: string | null; // enviaremos "YYYY-MM-DD"
  HDL_cholesterol?: number | null;
  HDL_data?: string | null;
  BP_classifications?: string | null;
  framingham_score?: string | null;
  conduct_adopted?: string | null;
  any_complications_HBP?: string | null;
};

export type DmApiPayload = {
  patient: number;
  is_diagnosed?: boolean | null;
  uses_medication?: "SIM" | "NAO" | "IRREGULAR" | "NAO_SE_APLICA" | null;
  family_history?: boolean | null;
  capillary_blood_glucose_random?: string | null;
  fasting_capillary_blood_glucose?: string | null;
  glycated_hemoglobin?: string | null;
};

/** FRONT (form) → BACK (Patient API)
 *  mode: "create" envia user; "edit" não envia user.
 */
export function formToPatientApi(
  data: RegistroPacienteCreate | RegistroPacienteEdit,
  mode: "create" | "edit",
  addressId?: number | null
): PatientApiPayload {
  const socio: any = (data as any).socio ?? {};
  const multiprof: any = (data as any).multiprof ?? {};
  const clinica: any = (data as any).clinica ?? {};
  const hasClinica: any = clinica?.has ?? {};
  const dmClinica: any = clinica?.dm ?? {};

  const lifeSrc: any =
    hasClinica && Object.keys(hasClinica).length > 0 ? hasClinica : dmClinica;

  // nome → quebra simples em first_name / last_name
  const nome: string = socio?.nome?.trim?.() ?? "";
  const [first_name, ...rest] = nome.split(/\s+/);
  const last_name = rest.join(" ");

  // e-mail: campo opcional no form
  const rawEmail = optString(socio?.email);

  let password: string | undefined;
  if (mode === "create") {
    // se um dia tiver campo de senha no form, ele tem prioridade
    password = socio?.password || socio?.senha || generateSimplePassword();
  }

  // LOGIN (crítico) – montamos sempre que for create
  // Regra: username = CPF (somente dígitos) validado pelo SocioZ
  const usernameFromCpf = onlyDigits(socio?.sus_cpf);

  const user =
    mode === "create" && usernameFromCpf
      ? {
          username: usernameFromCpf,
          first_name: first_name || "Paciente",
          last_name: last_name || "",
          ...(rawEmail ? { email: rawEmail } : {}),
          password: password as string,
        }
      : undefined;

  const renda =
    typeof socio?.renda_familiar === "number"
      ? socio.renda_familiar.toFixed(2)
      : socio?.renda_familiar != null && socio.renda_familiar !== ""
        ? String(socio.renda_familiar)
        : null;

  // maps específicos da etapa multiprof
  const diseaseChoiceMap: Record<string, string> = {
    chagas: "CHAGAS",
    leishmaniose: "LEISHMANIOSE",
    tuberculose: "TUBERCULOSE",
    toxoplasmose: "TOXOPLASMOSE",
    esporotricose: "ESPOROTRICOSE",
    hanseniase: "HANSENIASE",
  };

  const referralChoiceMap: Record<string, string> = {
    psicologo: "PSICOLOGO",
    medico_vet: "MEDICO_VETERINARIO",
    fisioterapeuta: "FISIOTERAPEUTA",
    assistente_social: "ASSISTENTE_SOCIAL",
    enfermeira: "ENFERMEIRA",
    nutricionista: "NUTRICIONISTA",
    cirurgia_dentista: "CIRURGIA_DENTISTA",
    // "outro" não tem campo específico no backend; ignoramos aqui
  };

  // ───── Estilo de Vida (LifeStyle no backend) ─────
  const feed =
    lifeSrc?.estilo_alimentacao && feedingMap[lifeSrc.estilo_alimentacao]
      ? feedingMap[lifeSrc.estilo_alimentacao]
      : null;

  const salt =
    lifeSrc?.sal && saltConsumptionMap[lifeSrc.sal]
      ? saltConsumptionMap[lifeSrc.sal]
      : null;

  const alcohol =
    lifeSrc?.alcool && alcoholConsumptionMap[lifeSrc.alcool]
      ? alcoholConsumptionMap[lifeSrc.alcool]
      : null;

  const smoking =
    lifeSrc?.tabagismo && smokingMap[lifeSrc.tabagismo]
      ? smokingMap[lifeSrc.tabagismo]
      : null;

  const lastConsult = (() => {
    if (
      lifeSrc?.ultima_consulta_has &&
      lastConsultationMap[lifeSrc.ultima_consulta_has]
    ) {
      return lastConsultationMap[lifeSrc.ultima_consulta_has];
    }
    if (
      lifeSrc?.ultima_consulta_dm &&
      lastConsultationMap[lifeSrc.ultima_consulta_dm]
    ) {
      return lastConsultationMap[lifeSrc.ultima_consulta_dm];
    }
    return null;
  })();

  const payload: PatientApiPayload = {
    ...(user ? { user } : {}),

    // ───── Sociodemográficos básicos ─────
    cpf: onlyDigits(socio?.sus_cpf) || null,
    birth_date: toDateISO(socio?.nascimento),
    age: calcAgeFromBirth(socio?.nascimento),

    gender: optString(socio?.genero) ?? null,
    race_ethnicity: optString(socio?.raca_etnia) ?? null,

    scholarity: socio?.escolaridade
      ? (scholarityMap[socio.escolaridade] ?? null)
      : null,

    occupation: optString(socio?.ocupacao) ?? null,

    civil_status: socio?.estado_civil
      ? (civilStatusMap[socio.estado_civil] ?? null)
      : null,

    people_per_household:
      typeof socio?.n_pessoas_domicilio === "number"
        ? socio.n_pessoas_domicilio
        : null,

    family_responsability: optString(socio?.responsavel_familiar) ?? null,
    family_income: renda,
    bolsa_familia: nullableBool(socio?.bolsa_familia),

    micro_area:
      typeof socio?.micro_area_id === "number" ? socio.micro_area_id : null,
    address:
      typeof (socio as any)?.address_id === "number"
        ? (socio as any).address_id
        : null,

    phone: onlyDigits(socio?.telefone) || null,
    whatsapp: nullableBool(socio?.whatsapp),

    /** ───────── PsychosocialRisks (psico_*) ───────── */
    use_psychotropic_medication: yesNoMaybeToBool(
      multiprof?.psico_uso_psicofarmaco
    ),
    use_psychotropic_medication_answer:
      optString(multiprof?.psico_psicofarmaco_qual) ?? null,
    any_psychological_psychiatric_diagnosis: yesNoMaybeToBool(
      multiprof?.psico_diagnostico
    ),
    any_psychological_psychiatric_diagnosis_answer:
      optString(multiprof?.psico_diagnostico_qual) ?? null,
    everyday_stress_interfere_with_your_BP_BS_control: yesNoMaybeToBool(
      multiprof?.psico_estresse_interfere
    ),
    economic_factors_interfere_with_your_treatment: yesNoMaybeToBool(
      multiprof?.psico_fatores_economicos
    ),
    feel_receive_support_from_family_friends_to_maintain_treatment:
      yesNoMaybeToBool(multiprof?.psico_apoio_suficiente),
    regularly_follow_health_guidelines: yesNoMaybeToBool(
      multiprof?.psico_cumpre_orientacoes
    ),

    /** ───────── EnvironmentalRisks (ambi_*) ───────── */
    presence_of_pets_at_home: yesNoMaybeToBool(
      multiprof?.ambi_animais_domicilio
    ),
    presence_of_pets_at_home_answer:
      optString(multiprof?.ambi_animais_quais) ?? null,
    your_animals_are_vaccinated: yesNoMaybeToBool(
      multiprof?.ambi_animais_vacinados
    ),
    delayed_wound_healing_after_scratches_or_bites: yesNoMaybeToBool(
      multiprof?.ambi_feridas_demoram
    ),
    diagnosed_transmissible_disease_in_household: (() => {
      const arr = multiprof?.ambi_doencas_transmissiveis as
        | string[]
        | undefined;
      const first = arr?.[0];
      if (!first) return null;
      return diseaseChoiceMap[first] ?? null;
    })(),
    direct_contact_with_animal_bodily_fluids:
      optString(multiprof?.ambi_contato_sangue_fezes_urina) ?? null,
    received_guidance_on_zoonoses: yesNoMaybeToBool(
      multiprof?.ambi_orientacao_zoonoses
    ),

    /** ───────── PhysicalMotorRisks (fisico_*) ───────── */
    performs_physical_activity: yesNoMaybeToBool(multiprof?.fisico_atividade),
    performs_physical_activity_answer:
      multiprof?.fisico_atividade_freq_semana != null &&
      multiprof.fisico_atividade_freq_semana !== ""
        ? String(multiprof.fisico_atividade_freq_semana)
        : null,
    has_edema: yesNoMaybeToBool(multiprof?.fisico_edemas),
    has_dyspnea: yesNoMaybeToBool(multiprof?.fisico_dispneia),
    has_paresthesia_or_cramps: yesNoMaybeToBool(
      multiprof?.fisico_formigamento_caimbras
    ),
    has_difficulty_walking_or_activity: yesNoMaybeToBool(
      multiprof?.fisico_dificuldade_caminhar
    ),

    /** ───────── ClassificationConducmMultiProfessional ───────── */
    requires_multidisciplinary_referral: yesNoMaybeToBool(
      multiprof?.precisa_enc_multiprof
    ),
    requires_multidisciplinary_referral_choose: (() => {
      const arr = multiprof?.enc_multiprof as string[] | undefined;
      if (!arr || arr.length === 0) return null;

      const first = arr.find((v) => v !== "outro") ?? arr[0];
      return referralChoiceMap[first] ?? null;
    })(),
    /** ───────── LifeStyle ───────── */
    feed,
    salt_consumption: salt,
    alcohol_consumption: alcohol,
    smoking,
    last_consultation: lastConsult,
  };

  return payload;
}

/** BACK (Patient API) → FRONT (form defaultValues)
 *  - Se o back não tiver valor, mandamos undefined/"" pro form.
 *  - Login (nome) continua preenchido pelo user.
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

  // deixamos gênero realmente opcional no form
  socio.genero = api?.gender ?? undefined;
  socio.genero_outro = "";

  // se race_ethnicity vier nulo, não inventamos "nao_informado"
  socio.raca_etnia = api?.race_ethnicity ?? undefined;

  socio.telefone = api?.phone ?? "";
  socio.whatsapp =
    typeof api?.whatsapp === "boolean" ? api.whatsapp : undefined;

  // ───── Endereço ─────
  const address: any = api?.address_obj ?? api?.address ?? null;
  const hasAddress = address && typeof address === "object";

  const logradouro =
    hasAddress && (address.street || address.number)
      ? `${address.street ?? ""}${
          address.number ? `, ${address.number}` : ""
        }`.trim()
      : "";

  socio.endereco = {
    logradouro,
    bairro: hasAddress ? (address.district ?? "") : "",
    cidade: hasAddress ? (address.city ?? "") : "",
    uf: hasAddress ? (address.uf ?? undefined) : undefined,
    cep: hasAddress ? (address.zipcode ?? "") : "",
  };

  // ───── Demais campos sociodemográficos ─────
  socio.n_pessoas_domicilio =
    api?.people_per_household != null ? api.people_per_household : undefined;

  socio.responsavel_familiar = api?.family_responsability ?? "";

  socio.renda_familiar =
    api?.family_income != null && api.family_income !== ""
      ? api.family_income
      : undefined;

  socio.bolsa_familia =
    typeof api?.bolsa_familia === "boolean" ? api.bolsa_familia : undefined;

  socio.escolaridade = api?.scholarity
    ? (scholarityBackToFront[api.scholarity] ?? undefined)
    : undefined;

  socio.ocupacao = api?.occupation ?? "";

  socio.estado_civil = api?.civil_status
    ? (civilStatusBackToFront[api.civil_status] ?? undefined)
    : undefined;

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

function hasClinicaHasData(has: any | undefined | null): boolean {
  if (!has) return false;

  return (
    has.diag_has != null ||
    has.usa_medicacao != null ||
    has.pa1_sis != null ||
    has.pa1_dia != null ||
    has.pa2_sis != null ||
    has.pa2_dia != null ||
    has.peso != null ||
    has.imc != null ||
    has.circ_abdominal != null ||
    has.col_total != null ||
    has.col_total_data != null ||
    has.hdl != null ||
    has.hdl_data != null ||
    has.classificacao_pa != null ||
    has.framingham != null ||
    (Array.isArray(has.condutas) && has.condutas.length > 0) ||
    (Array.isArray(has.complicacoes) && has.complicacoes.length > 0)
  );
}

export function formToHasApi(
  data: RegistroPacienteCreate | RegistroPacienteEdit,
  patientId: number
): HasApiPayload | null {
  const cond = (data as any).condicoes;
  const has = (data as any).clinica?.has;
  const familyHistory = yesNoMaybeToBool(has?.historico_familiar);

  // 🔒 Regra de ouro:
  // - se NÃO marcou HAS
  // - e também NÃO preencheu nada do bloco clínico de HAS
  //   → não cria/atualiza registro nenhum
  if (!cond?.has && !hasClinicaHasData(has)) {
    return null;
  }

  // normaliza tratamento
  const usesMedication =
    has?.usa_medicacao && treatmentStatusMap[has.usa_medicacao]
      ? (treatmentStatusMap[
          has.usa_medicacao
        ] as HasApiPayload["uses_medication"])
      : null;

  // normaliza campos numéricos (mantendo padrão string com 2 casas para decimais)
  const weight =
    has && typeof has.peso === "number"
      ? has.peso.toFixed(2)
      : has?.peso != null
        ? String(has.peso)
        : null;

  const height =
    has && typeof has.altura === "number"
      ? has.altura.toFixed(2)
      : has?.altura != null
        ? String(has.altura)
        : null;

  const imc =
    has && typeof has.imc === "number"
      ? has.imc.toFixed(2)
      : has?.imc != null
        ? String(has.imc)
        : null;

  const abdominalCirc =
    has && typeof has.circ_abdominal === "number"
      ? has.circ_abdominal.toFixed(2)
      : has?.circ_abdominal != null
        ? String(has.circ_abdominal)
        : null;

  // Colesterol (ClinicalEvaluationHAS)
  const cholesterolData = has?.col_total_data
    ? toDateISO(has.col_total_data as any)
    : null;

  const hdlData = has?.hdl_data ? toDateISO(has.hdl_data as any) : null;

  // Classificação / Escore / Conduta (ClassificationConductHAS)
  const bpClassification =
    has?.classificacao_pa && bpClassificationMap[has.classificacao_pa]
      ? bpClassificationMap[has.classificacao_pa]
      : null;

  const framinghamScore =
    has?.framingham && framinghamMap[has.framingham]
      ? framinghamMap[has.framingham]
      : null;

  const conductAdopted = (() => {
    const arr = has?.condutas as string[] | undefined;
    if (!arr || arr.length === 0) return null;
    const first = arr.find((v) => v !== "outro") ?? arr[0];
    return conductHasMap[first] ?? null;
  })();
  const complicationEnum = (() => {
    const arr = has?.complicacoes as string[] | undefined;
    if (!arr || arr.length === 0) return null;

    const first = arr.find((v) => v !== "outra") ?? arr[0];
    return hasComplicationsMap[first] ?? null;
  })();

  return {
    patient: patientId,
    is_diagnosed: yesNoMaybeToBool(has?.diag_has),
    uses_medication: usesMedication,
    family_history: familyHistory,
    BP_assessment1_1: has?.pa1_sis ?? null,
    BP_assessment1_2: has?.pa1_dia ?? null,
    BP_assessment2_1: has?.pa2_sis ?? null,
    BP_assessment2_2: has?.pa2_dia ?? null,
    weight: weight,
    height: height,
    IMC: imc,
    abdominal_circumference: abdominalCirc,
    total_cholesterol: has?.col_total != null ? Number(has.col_total) : null,
    cholesterol_data: cholesterolData,
    HDL_cholesterol: has?.hdl != null ? Number(has.hdl) : null,
    HDL_data: hdlData,

    BP_classifications: bpClassification,
    framingham_score: framinghamScore,
    conduct_adopted: conductAdopted,
    any_complications_HBP: complicationEnum,
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
    family_history: yesNoMaybeToBool(dm?.historico_familiar),
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
    historico_familiar: boolToYesNoMaybe(api.family_history),
    pa1_sis: api.BP_assessment1_1 ?? undefined,
    pa1_dia: api.BP_assessment1_2 ?? undefined,
    pa2_sis: api.BP_assessment2_1 ?? undefined,
    pa2_dia: api.BP_assessment2_2 ?? undefined,
    peso:
      api.weight != null && api.weight !== "" ? Number(api.weight) : undefined,
    altura:
      api.height != null && api.height !== "" ? Number(api.height) : undefined,
    imc: api.IMC != null && api.IMC !== "" ? Number(api.IMC) : undefined,
    circ_abdominal:
      api.abdominal_circumference != null && api.abdominal_circumference !== ""
        ? Number(api.abdominal_circumference)
        : undefined,
    col_total:
      api.total_cholesterol != null ? Number(api.total_cholesterol) : undefined,
    col_total_data: api.cholesterol_data ?? undefined,
    hdl: api.HDL_cholesterol != null ? Number(api.HDL_cholesterol) : undefined,
    hdl_data: api.HDL_data ?? undefined,
    classificacao_pa: api.BP_classifications
      ? (bpClassificationBackToFront[api.BP_classifications] ?? undefined)
      : undefined,
    framingham: api.framingham_score
      ? (framinghamBackToFront[api.framingham_score] ?? undefined)
      : undefined,
    condutas: (() => {
      if (!api.conduct_adopted) return [];
      const front = conductHasBackToFront[api.conduct_adopted];
      return front ? [front] : [];
    })(),
    conduta_outro: undefined,
    complicacoes: (() => {
      if (!api.any_complications_HBP) return [];
      const front = hasComplicationsBackToFront[api.any_complications_HBP];
      return front ? [front] : [];
    })(),
    complicacao_outra: undefined,
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

// Aplica LifeStyle (PatientUser) nos blocos clínicos HAS/DM do form
export function applyLifestyleFromPatientApiToClinica(
  defaultValues: any,
  patientApi: any
) {
  if (!defaultValues || !patientApi) return;

  const feedBack = patientApi.feed as string | null;
  const saltBack = patientApi.salt_consumption as string | null;
  const alcoholBack = patientApi.alcohol_consumption as string | null;
  const smokingBack = patientApi.smoking as string | null;
  const lastBack = patientApi.last_consultation as string | null;

  const feedFront = feedBack
    ? (feedingBackToFront[feedBack] ?? undefined)
    : undefined;
  const saltFront = saltBack
    ? (saltConsumptionBackToFront[saltBack] ?? undefined)
    : undefined;
  const alcoholFront = alcoholBack
    ? (alcoholConsumptionBackToFront[alcoholBack] ?? undefined)
    : undefined;
  const smokingFront = smokingBack
    ? (smokingBackToFront[smokingBack] ?? undefined)
    : undefined;
  const lastFront = lastBack
    ? (lastConsultationBackToFront[lastBack] ?? undefined)
    : undefined;

  // Garante estrutura clinica
  if (!defaultValues.clinica) {
    defaultValues.clinica = { has: undefined, dm: undefined };
  }

  const has = (defaultValues.clinica.has =
    defaultValues.clinica.has ?? ({} as any));
  const dm = (defaultValues.clinica.dm =
    defaultValues.clinica.dm ?? ({} as any));

  // Só aplica se o campo ainda não tiver valor (pra não atropelar algo do form)
  if (feedFront && has.estilo_alimentacao == null)
    has.estilo_alimentacao = feedFront;
  if (saltFront && has.sal == null) has.sal = saltFront;
  if (alcoholFront && has.alcool == null) has.alcool = alcoholFront;
  if (smokingFront && has.tabagismo == null) has.tabagismo = smokingFront;
  if (lastFront && has.ultima_consulta_has == null)
    has.ultima_consulta_has = lastFront;

  // DM usa os mesmos valores globais
  if (feedFront && dm.estilo_alimentacao == null)
    dm.estilo_alimentacao = feedFront;
  if (saltFront && dm.sal == null) dm.sal = saltFront;
  if (alcoholFront && dm.alcool == null) dm.alcool = alcoholFront;
  if (smokingFront && dm.tabagismo == null) dm.tabagismo = smokingFront;
  if (lastFront && dm.ultima_consulta_dm == null)
    dm.ultima_consulta_dm = lastFront;
}
