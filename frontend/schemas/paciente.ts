// frontend/schemas/paciente.ts
import { z } from "zod";

/** ========= Helpers ========= **/
const emptyToUndef = (v: unknown) =>
  v === "" || v === null || typeof v === "undefined" ? undefined : v;

const StrOpt = z.preprocess(emptyToUndef, z.string());
const NumOpt = z.preprocess(emptyToUndef, z.coerce.number());
const IntOpt = z.preprocess(emptyToUndef, z.coerce.number().int());
const DateOpt = z.preprocess(emptyToUndef, z.coerce.date());

const NumPosOpt = (msg = "Valor inválido") =>
  z.preprocess(emptyToUndef, z.coerce.number().positive(msg));
const IntPosOpt = (msg = "Valor inválido") =>
  z.preprocess(emptyToUndef, z.coerce.number().int().positive(msg));

/** ========= Enums base ========= **/
export const UFZ = z.enum([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const YesNoMaybeZ = z.enum(["sim", "nao", "nao_sabe"]);
const SimNaoZ = z.enum(["sim", "nao"]);
const SimNaoNsaZ = z.enum(["sim", "nao", "nao_se_aplica"]);

export const EstadoCivilZ = z.enum([
  "solteiro",
  "casado",
  "uniao_estavel",
  "viuvo",
  "separado",
]);

export const EscolaridadeZ = z.enum([
  "fund_incompleto",
  "fund_completo",
  "medio_incompleto",
  "medio_completo",
  "sup_incompleto",
  "sup_completo",
  "sem_escolaridade",
]);

/* ########################
 * STEP 1 — SOCIODEMOGRÁFICOS
 * ######################## */
export const SocioZ = z
  .object({
    nome: z.string().min(3, "Informe o nome completo"),
    nascimento: DateOpt, // exigido via refine abaixo

    genero: z.enum(["M", "F", "O"]),
    genero_outro: StrOpt.optional(),
    raca_etnia: StrOpt.optional(),

    // CPF somente (11 dígitos). Para aceitar CNS também, veja bloco comentado abaixo.
    sus_cpf: z
      .string()
      .transform((s) => s.replace(/\D+/g, ""))
      .refine((s) => /^\d{11}$/.test(s), "CPF inválido"),

    // // CPF (11) OU CNS (15):
    // sus_cpf: z
    //   .string()
    //   .transform((s) => s.replace(/\D+/g, ""))
    //   .refine((s) => /^\d{11}$|^\d{15}$/.test(s), "Informe CPF (11) ou CNS (15)"),

    acs_responsavel: StrOpt.optional(),
    /** @deprecated use 'acs_responsavel' (string) */
    acs_responsavel_id: z
      .preprocess(emptyToUndef, z.coerce.number().int())
      .optional(),

    telefone: z
      .string()
      .transform((s) => s.replace(/\D+/g, ""))
      .refine(
        (s) => s.length >= 10 && s.length <= 11,
        "Informe telefone válido"
      ),
    whatsapp: z.boolean().default(false),

    endereco: z.object({
      logradouro: z.string().min(3, "Informe endereço"),
      bairro: z.string().min(2, "Informe bairro"),
      cidade: z.string().min(2, "Informe cidade"),
      uf: UFZ,
      cep: StrOpt.optional().refine(
        (v) => !v || /^\d{5}-?\d{3}$/.test(v),
        "CEP inválido"
      ),
    }),

    n_pessoas_domicilio: IntOpt.optional(),
    responsavel_familiar: StrOpt.optional(),
    renda_familiar: NumOpt.optional(),
    bolsa_familia: z.boolean().default(false),

    escolaridade: EscolaridadeZ,
    ocupacao: StrOpt.optional(),

    estado_civil: EstadoCivilZ,
  })
  .refine((v) => (v.genero !== "O" ? true : !!v.genero_outro?.trim()), {
    path: ["genero_outro"],
    message: "Descreva o gênero",
  })
  .refine((v) => !!v.nascimento, {
    path: ["nascimento"],
    message: "Informe a data de nascimento",
  });

/* ########################
 * STEP 2 — CONDIÇÕES CRÔNICAS
 * ######################## */
export const CondicoesZ = z
  .object({
    has: z.boolean().default(false),
    dm: z.boolean().default(false),
    outras_dcnts: StrOpt.optional(),
    outras_em_acompanhamento: SimNaoNsaZ.optional(),
  })
  .refine((v) => v.has || v.dm || (v.outras_dcnts?.trim().length ?? 0) > 0, {
    message: "Selecione HAS/DM ou informe outras DCNTs.",
    path: ["has"],
  });

/* ########################
 * STEP 3 — CLÍNICA (HAS / DM condicionais)
 * ######################## */
export const ClinicaHASZ = z.object({
  diag_has: YesNoMaybeZ,
  usa_medicacao: z.enum(["sim", "nao", "irregular", "nao_se_aplica"]),
  medicamentos: StrOpt.optional(),
  historico_familiar: YesNoMaybeZ,
  complicacoes: z
    .array(z.enum(["avc", "infarto", "renal", "outra"]))
    .optional(),
  complicacao_outra: StrOpt.optional(),

  // Pressão arterial (duas aferições)
  pa1_sis: IntPosOpt("Sistólica inválida").optional(),
  pa1_dia: IntPosOpt("Diastólica inválida").optional(),
  pa2_sis: IntPosOpt("Sistólica inválida").optional(),
  pa2_dia: IntPosOpt("Diastólica inválida").optional(),

  // Medidas / estilo de vida / labs
  peso: NumPosOpt("Peso inválido").optional(),
  altura: NumPosOpt("Altura inválida").optional(),
  imc: NumPosOpt("IMC inválido").optional(),
  circ_abdominal: NumPosOpt("Valor inválido").optional(),
  estilo_alimentacao: z.enum(["saudavel", "parcial", "pouco"]).optional(),
  sal: z.enum(["adequado", "exagerado", "nao_sabe"]).optional(),
  alcool: z.enum(["nao_bebe", "socialmente", "frequentemente"]).optional(),
  tabagismo: z.enum(["nunca", "ex", "atual"]).optional(),

  col_total: NumPosOpt("Valor inválido").optional(),
  col_total_data: DateOpt.optional(),
  hdl: NumPosOpt("Valor inválido").optional(),
  hdl_data: DateOpt.optional(),

  ultima_consulta_has: z
    .enum(["7d", "15d", "30d", "60d", "90d", "6m", "1a", ">1a"])
    .optional(),
  classificacao_pa: z
    .enum(["normal", "pre_hipertenso", "estagio1", "estagio2", "estagio3"])
    .optional(),
  framingham: z.enum(["<10", "10-20", ">20"]).optional(),

  condutas: z
    .array(z.enum(["aps", "encaminhamento", "grupo", "outro"]))
    .optional(),
  conduta_outro: StrOpt.optional(),
});

export const ClinicaDMZ = z.object({
  diag_dm: YesNoMaybeZ,
  usa_medicacao: z.enum(["sim", "nao", "irregular", "nao_se_aplica"]),
  tipo_tratamento: z
    .array(z.enum(["medicamentoso", "insulina", "alimentar", "outro"]))
    .optional(),
  medicamentos: StrOpt.optional(),
  historico_familiar: YesNoMaybeZ,
  comorbidades: z
    .array(z.enum(["cardiaca", "renal", "visual", "vascular", "outra"]))
    .optional(),
  pe_diabetico: SimNaoZ.optional(),
  pe_diabetico_membro: StrOpt.optional(),

  glicemia_aleatoria: NumPosOpt("Valor inválido").optional(),
  glicemia_jejum: NumPosOpt("Valor inválido").optional(),
  glicemia_jejum_data: DateOpt.optional(),
  hba1c: NumPosOpt("Valor inválido").optional(),
  hba1c_data: DateOpt.optional(),

  estilo_alimentacao: z.enum(["saudavel", "parcial", "pouco"]).optional(),
  sal: z.enum(["adequado", "exagerado", "nao_sabe"]).optional(),
  alcool: z.enum(["nao_bebe", "socialmente", "frequentemente"]).optional(),
  tabagismo: z.enum(["nunca", "ex", "atual"]).optional(),

  peso: NumPosOpt("Peso inválido").optional(),
  altura: NumPosOpt("Altura inválida").optional(),
  imc: NumPosOpt("IMC inválido").optional(),
  circ_abdominal: NumPosOpt("Valor inválido").optional(),

  ultima_consulta_dm: z
    .enum(["7d", "15d", "30d", "60d", "90d", "6m", "1a", ">1a"])
    .optional(),
  triagem_dm: z
    .enum([
      "normal",
      "glicemia_alterada",
      "suspeita_dm",
      "diagnostico_confirmado",
    ])
    .optional(),

  // Fatores de risco
  risco_idade_45: SimNaoZ.optional(),
  risco_imc_25: SimNaoZ.optional(),
  risco_sedentarismo: SimNaoZ.optional(),
  risco_pa_elevada: SimNaoZ.optional(),
  risco_lipidios_alterados: SimNaoZ.optional(),
  risco_dm_gestacional: SimNaoNsaZ.optional(),
  risco_sop: SimNaoNsaZ.optional(),

  condutas: z
    .array(
      z.enum([
        "confirmacao_lab",
        "inicio_trat",
        "orientacao",
        "encaminhamento_med",
        "outro",
      ])
    )
    .optional(),
  conduta_outro: StrOpt.optional(),
});

/* ########################
 * STEP 4 — AVALIAÇÃO MULTIPROFISSIONAL
 * ######################## */
export const MultiprofZ = z.object({
  psico_uso_psicofarmaco: SimNaoZ.optional(),
  psico_psicofarmaco_qual: StrOpt.optional(),
  psico_diagnostico: YesNoMaybeZ.optional(),
  psico_diagnostico_qual: StrOpt.optional(),
  psico_estresse_interfere: SimNaoZ.optional(),
  psico_fatores_economicos: SimNaoZ.optional(),
  psico_apoio_suficiente: YesNoMaybeZ.optional(),
  psico_cumpre_orientacoes: SimNaoZ.optional(),

  ambi_animais_domicilio: YesNoMaybeZ.optional(),
  ambi_animais_quais: StrOpt.optional(),
  ambi_animais_vacinados: YesNoMaybeZ.optional(),
  ambi_feridas_demoram: SimNaoZ.optional(),
  ambi_doencas_transmissiveis: z
    .array(
      z.enum([
        "chagas",
        "leishmaniose",
        "tuberculose",
        "toxoplasmose",
        "esporotricose",
        "hanseniase",
      ])
    )
    .optional(),
  ambi_doencas_outro: StrOpt.optional(),
  ambi_contato_sangue_fezes_urina: YesNoMaybeZ.optional(),
  ambi_orientacao_zoonoses: YesNoMaybeZ.optional(),

  fisico_atividade: SimNaoZ.optional(),
  fisico_atividade_freq_semana: IntOpt.optional(),
  fisico_edemas: SimNaoZ.optional(),
  fisico_dispneia: SimNaoZ.optional(),
  fisico_formigamento_caimbras: SimNaoZ.optional(),
  fisico_dificuldade_caminhar: SimNaoZ.optional(),

  precisa_enc_multiprof: SimNaoZ.optional(),
  enc_multiprof: z
    .array(
      z.enum([
        "psicologo",
        "medico_vet",
        "fisioterapeuta",
        "assistente_social",
        "enfermeira",
        "nutricionista",
        "cirurgia_dentista",
        "outro",
      ])
    )
    .optional(),
  enc_multiprof_outro: StrOpt.optional(),
});

/* ########################
 * STEP 5 — PLANO & AGENDAMENTOS
 * ######################## */
export const PlanoZ = z.object({
  resumo: StrOpt.optional(),
  tipo_consulta: z
    .enum(["consulta", "retorno", "avaliacao", "outro"])
    .optional(),
  data_consulta: DateOpt.optional(),
  data_retorno: DateOpt.optional(),
  assinatura: StrOpt.optional(),
});

/* ########################
 * SCHEMAS GERAIS (CREATE/EDIT)
 * ######################## */
export const RegistroPacienteCreateZ = z
  .object({
    socio: SocioZ,
    condicoes: CondicoesZ,
    clinica: z.object({
      has: ClinicaHASZ.optional(),
      dm: ClinicaDMZ.optional(),
    }),
    multiprof: MultiprofZ.optional(),
    plano: PlanoZ.optional(),
  })
  .superRefine((all, ctx) => {
    if (all.condicoes.has && !all.clinica?.has) {
      ctx.addIssue({
        path: ["clinica", "has"],
        code: "custom",
        message: "Preencha os dados de HAS.",
      });
    }
    if (all.condicoes.dm && !all.clinica?.dm) {
      ctx.addIssue({
        path: ["clinica", "dm"],
        code: "custom",
        message: "Preencha os dados de DM.",
      });
    }
  });

/** ===== Edit (PATCH) sem deepPartial: partials aninhados ===== */
const SocioEditZ = SocioZ.partial().extend({
  endereco: SocioZ.shape.endereco.partial(), // endereço também parcial
});

const CondicoesEditZ = CondicoesZ.partial();

const ClinicaEditZ = z.object({
  has: ClinicaHASZ.partial().optional(),
  dm: ClinicaDMZ.partial().optional(),
});

const MultiprofEditZ = MultiprofZ.partial();
const PlanoEditZ = PlanoZ.partial();

export const RegistroPacienteEditZ = z.object({
  socio: SocioEditZ.optional(),
  condicoes: CondicoesEditZ.optional(),
  clinica: ClinicaEditZ.optional(),
  multiprof: MultiprofEditZ.optional(),
  plano: PlanoEditZ.optional(),
});

// Tipos
export type RegistroPacienteCreate = z.infer<typeof RegistroPacienteCreateZ>;
export type RegistroPacienteEdit = z.infer<typeof RegistroPacienteEditZ>;
