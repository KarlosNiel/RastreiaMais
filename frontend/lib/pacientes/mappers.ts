// frontend/lib/pacientes/mappers.ts
import type {
  RegistroPacienteCreate,
  RegistroPacienteEdit,
} from "@/schemas/paciente";

import {
  alcoholConsumptionBackToFront,
  alcoholConsumptionMap,
  bpClassificationBackToFront,
  bpClassificationMap,
  civilStatusBackToFront,
  civilStatusMap,
  conductHasBackToFront,
  conductHasMap,
  diseaseChoiceMap,
  feedingBackToFront,
  feedingMap,
  framinghamBackToFront,
  framinghamMap,
  hasComplicationsBackToFront,
  hasComplicationsMap,
  lastConsultationBackToFront,
  lastConsultationMap,
  referralChoiceMap,
  saltConsumptionBackToFront,
  saltConsumptionMap,
  scholarityBackToFront,
  scholarityMap,
  smokingBackToFront,
  smokingMap,
  treatmentStatusBackToFront,
  treatmentStatusMap,
} from "@/lib/pacientes/enums";

import {
  boolToSimNao,
  boolToYesNoMaybe,
  calcAgeFromBirth,
  generateSimplePassword,
  nullableBool,
  onlyDigits,
  optString,
  toDateISO,
  yesNoMaybeToBool,
} from "@/lib/pacientes/utils";

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

  // LifeStyle
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
  medications_name?: string | null;
  any_complications_HBP?: string | null;
};

export type DmApiPayload = {
  patient: number;
  is_diagnosed?: boolean | null;
  uses_medication?: "SIM" | "NAO" | "IRREGULAR" | "NAO_SE_APLICA" | null;
  medications_name?: string | null;
  family_history?: boolean | null;
  capillary_blood_glucose_random?: string | null;
  fasting_capillary_blood_glucose?: string | null;
  glycated_hemoglobin?: string | null;
};

export type AppointmentApiPayload = {
  patient_id: number;
  professional_id: number;
  local_id?: number | null;
  scheduled_datetime: string;
  type: "Consulta" | "Exame" | "Evento";
  description?: string;
  risk_level: "Seguro" | "Moderado" | "Crítico";
  status?: "pendente" | "ativo" | "finalizado" | "cancelado";
};

/**
 * Helper interno: converte valor de data (Date, string, etc)
 * para ISO datetime com hora fixa (ex.: 08:00).
 */
export function toDateTimeISO(
  value: unknown,
  hour = 8,
  minute = 0
): string | null {
  if (!value) return null;
  const d = new Date(value as any);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formToAppointmentApi(
  data: RegistroPacienteCreate | RegistroPacienteEdit,
  patientId: number,
  professionalId: number
): AppointmentApiPayload | null {
  const plano: any = (data as any).plano ?? null;
  if (!plano) return null;

  /* ===========================
   * 1) DATA E HORA DO AGENDAMENTO
   * =========================== */

  // Regra: prioriza data_consulta; se não tiver, usa data_retorno
  const rawDate = plano.data_consulta ?? plano.data_retorno;
  if (!rawDate) {
    // Sem data, não há como criar agendamento
    return null;
  }

  const rawTime: string | undefined = plano.hora_consulta;
  let hour = 8;
  let minute = 0;

  // Aceita apenas HH:MM 24h; se não bater, usa 08:00 padrão
  if (typeof rawTime === "string") {
    const match = rawTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (match) {
      hour = Number.parseInt(match[1], 10);
      minute = Number.parseInt(match[2], 10);
    }
  }

  const scheduled = toDateTimeISO(rawDate, hour, minute);
  if (!scheduled) {
    // Data inválida
    return null;
  }

  /* ===========================
   * 2) TIPO DO AGENDAMENTO
   * =========================== */

  const rawType: string = plano.tipo_consulta ?? "consulta";

  // Mapeamento para o enum do backend
  const typeMap: Record<string, AppointmentApiPayload["type"]> = {
    consulta: "Consulta",
    retorno: "Consulta", // domínio atual: retorno ainda é uma consulta
    avaliacao: "Exame",
    outro: "Evento",
  };

  const type = typeMap[rawType] ?? "Consulta";

  // Label amigável para aparecer na descrição
  const tipoLabelMap: Record<string, string> = {
    consulta: "Consulta",
    retorno: "Retorno",
    avaliacao: "Avaliação",
    outro: "Outro",
  };

  const tipoLabel = tipoLabelMap[rawType] ?? "Consulta";

  /* ===========================
   * 3) DESCRIÇÃO
   * =========================== */

  const descricaoBase = (() => {
    const resumo = optString(plano.resumo);
    const assinatura = optString(plano.assinatura);

    if (resumo && assinatura) {
      return `${resumo}\n\nProfissional: ${assinatura}`;
    }
    if (resumo) return resumo;
    if (assinatura) return `Plano registrado por: ${assinatura}`;
    return "Plano registrado sem descrição detalhada.";
  })();

  const description = `Tipo de atendimento: ${tipoLabel}.\n\n${descricaoBase}`;

  /* ===========================
   * 4) RISCO / OUTROS CAMPOS
   * =========================== */

  const risk_level: AppointmentApiPayload["risk_level"] = "Moderado";

  return {
    patient_id: patientId,
    professional_id: professionalId,
    local_id: plano.local_id ?? null,
    scheduled_datetime: scheduled,
    type,
    description,
    risk_level,
    status: "ativo",
  };
}

/* =======================================================================
 * FRONT (form) → BACK (Patient API)
 * ======================================================================= */

/**
 * mode: "create" envia user; "edit" não envia user.
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
  const nome: string = socio?.nome?.trim?.() ?? "";
  const [first_name, ...rest] = nome.split(/\s+/);
  const last_name = rest.join(" ");
  const rawEmail = optString(socio?.email);
  let password: string | undefined;
  if (mode === "create") {
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
    people_per_household:
      typeof socio?.n_pessoas_domicilio === "number"
        ? socio.n_pessoas_domicilio
        : null,
    family_responsability: optString(socio?.responsavel_familiar) ?? null,
    family_income: renda,
    bolsa_familia: nullableBool(socio?.bolsa_familia),
    micro_area:
      typeof socio?.micro_area_id === "number" ? socio.micro_area_id : null,

    civil_status: socio?.estado_civil
      ? (civilStatusMap[socio.estado_civil] ?? null)
      : null,

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

/* =======================================================================
 * BACK (Patient API) → FRONT (defaultValues)
 * ======================================================================= */

export function patientApiToForm(api: any): RegistroPacienteCreate {
  const socio: any = {};

  // user
  const user = api?.user ?? {};
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  // SocialdemographicData
  socio.nome = fullName || "";
  socio.sus_cpf = api?.cpf ?? "";
  socio.nascimento = api?.birth_date ?? null; // string yyyy-mm-dd ou null
  socio.genero = api?.gender ?? undefined;
  socio.genero_outro = "";
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

  // ───── Etapa 4 — Dados multiprofissionais ─────
  const multiprof: any = {};

  // ─── Riscos Psicossociais ───
  multiprof.psico_uso_psicofarmaco = boolToSimNao(
    api?.use_psychotropic_medication ?? null
  );
  multiprof.psico_psicofarmaco_qual =
    api?.use_psychotropic_medication_answer ?? "";

  multiprof.psico_diagnostico = boolToYesNoMaybe(
    api?.any_psychological_psychiatric_diagnosis
  );
  multiprof.psico_diagnostico_qual =
    api?.any_psychological_psychiatric_diagnosis_answer ?? "";

  multiprof.psico_estresse_interfere = boolToSimNao(
    api?.everyday_stress_interfere_with_your_BP_BS_control ?? null
  );
  multiprof.psico_fatores_economicos = boolToSimNao(
    api?.economic_factors_interfere_with_your_treatment ?? null
  );

  multiprof.psico_apoio_suficiente = boolToYesNoMaybe(
    api?.feel_receive_support_from_family_friends_to_maintain_treatment
  );
  multiprof.psico_cumpre_orientacoes = boolToSimNao(
    api?.regularly_follow_health_guidelines ?? null
  );

  // ─── Riscos Ambientais ───
  multiprof.ambi_animais_domicilio = boolToYesNoMaybe(
    api?.presence_of_pets_at_home
  );
  multiprof.ambi_animais_quais = api?.presence_of_pets_at_home_answer ?? "";

  multiprof.ambi_animais_vacinados = boolToYesNoMaybe(
    api?.your_animals_are_vaccinated
  );
  multiprof.ambi_feridas_demoram = boolToSimNao(
    api?.delayed_wound_healing_after_scratches_or_bites ?? null
  );

  const diseaseCode = api?.diagnosed_transmissible_disease_in_household ?? null;
  if (diseaseCode) {
    const found = Object.entries(diseaseChoiceMap).find(
      ([, back]) => back === diseaseCode
    );
    multiprof.ambi_doencas_transmissiveis = found ? [found[0]] : undefined;
  } else {
    multiprof.ambi_doencas_transmissiveis = undefined;
  }
  multiprof.ambi_doencas_outro = "";

  multiprof.ambi_contato_sangue_fezes_urina = boolToYesNoMaybe(
    api?.direct_contact_with_animal_bodily_fluids
  );
  multiprof.ambi_orientacao_zoonoses = boolToYesNoMaybe(
    api?.received_guidance_on_zoonoses
  );

  // ─── Riscos Físico-Motores ───
  multiprof.fisico_atividade = boolToSimNao(
    api?.performs_physical_activity ?? null
  );
  multiprof.fisico_atividade_freq_semana =
    api?.performs_physical_activity_answer != null &&
    api.performs_physical_activity_answer !== ""
      ? Number(api.performs_physical_activity_answer)
      : undefined;

  multiprof.fisico_edemas = boolToSimNao(api?.has_edema ?? null);
  multiprof.fisico_dispneia = boolToSimNao(api?.has_dyspnea ?? null);
  multiprof.fisico_formigamento_caimbras = boolToSimNao(
    api?.has_paresthesia_or_cramps ?? null
  );
  multiprof.fisico_dificuldade_caminhar = boolToSimNao(
    api?.has_difficulty_walking_or_activity ?? null
  );

  // ─── Encaminhamento Multiprofissional ───
  multiprof.precisa_enc_multiprof = boolToSimNao(
    api?.requires_multidisciplinary_referral ?? null
  );

  const referralCode = api?.requires_multidisciplinary_referral_choose ?? null;
  if (referralCode) {
    const found = Object.entries(referralChoiceMap).find(
      ([, back]) => back === referralCode
    );
    multiprof.enc_multiprof = found ? [found[0]] : undefined;
  } else {
    multiprof.enc_multiprof = undefined;
  }
  multiprof.enc_multiprof_outro = "";

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
    multiprof,
    plano: undefined as any,
  };
}

/* =======================================================================
 * HAS / DM – FRONT → BACK
 * ======================================================================= */

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
    medications_name:
      has?.medicamentos && has.medicamentos.trim()
        ? has.medicamentos.trim()
        : null,
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
  const usesMedication =
    dm?.usa_medicacao && treatmentStatusMap[dm.usa_medicacao]
      ? (treatmentStatusMap[
          dm.usa_medicacao
        ] as DmApiPayload["uses_medication"])
      : null;

  //só cria/atualiza DM se a flag do Step 2 estiver marcada
  if (!cond?.dm) {
    return null;
  }

  if (!dm) {
    return null;
  }

  return {
    patient: patientId,
    is_diagnosed: yesNoMaybeToBool(dm?.diag_dm),
    uses_medication: usesMedication,
    medications_name:
      dm?.medicamentos && dm.medicamentos.trim()
        ? dm.medicamentos.trim()
        : null,
    family_history: yesNoMaybeToBool(dm?.historico_familiar),
    capillary_blood_glucose_random: dm?.glicemia_aleatoria ?? null,
    fasting_capillary_blood_glucose: dm?.glicemia_jejum ?? null,
    glycated_hemoglobin: dm?.hba1c ?? null,
  };
}

/* =======================================================================
 * BACK (HAS/DM API) → FRONT (clinica.has / clinica.dm)
 * ======================================================================= */

export function hasApiToForm(api: any): any {
  if (!api) return undefined;

  return {
    diag_has: boolToYesNoMaybe(api.is_diagnosed),
    usa_medicacao: api.uses_medication
      ? (treatmentStatusBackToFront[api.uses_medication] ?? "nao_se_aplica")
      : "nao_se_aplica",
    medicamentos: api.medications_name ?? undefined,
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
    medicamentos: api.medications_name ?? undefined,
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

/* =======================================================================
 * Aplica LifeStyle (PatientUser) nos blocos clínicos HAS/DM
 * ======================================================================= */

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

  if (!defaultValues.clinica) {
    defaultValues.clinica = { has: undefined, dm: undefined };
  }

  const has =
    defaultValues.clinica.has ??
    (defaultValues.clinica.has = {} as Record<string, unknown>);

  const hasDMCondition =
    defaultValues?.condicoes?.dm === true || defaultValues.clinica.dm != null;

  const dm =
    hasDMCondition && defaultValues.clinica.dm !== undefined
      ? (defaultValues.clinica.dm as any)
      : hasDMCondition
        ? (defaultValues.clinica.dm = {} as Record<string, unknown>)
        : null;

  // 🔹 Sempre preenche HAS com Estilo de Vida (se estiver vazio)
  if (feedFront && has.estilo_alimentacao == null)
    has.estilo_alimentacao = feedFront;
  if (saltFront && has.sal == null) has.sal = saltFront;
  if (alcoholFront && has.alcool == null) has.alcool = alcoholFront;
  if (smokingFront && has.tabagismo == null) has.tabagismo = smokingFront;
  if (lastFront && has.ultima_consulta_has == null)
    has.ultima_consulta_has = lastFront;

  // 🔹 Só preenche DM se existir bloco DM
  if (dm) {
    if (feedFront && dm.estilo_alimentacao == null)
      dm.estilo_alimentacao = feedFront;
    if (saltFront && dm.sal == null) dm.sal = saltFront;
    if (alcoholFront && dm.alcool == null) dm.alcool = alcoholFront;
    if (smokingFront && dm.tabagismo == null) dm.tabagismo = smokingFront;
    if (lastFront && dm.ultima_consulta_dm == null)
      dm.ultima_consulta_dm = lastFront;
  }
}
