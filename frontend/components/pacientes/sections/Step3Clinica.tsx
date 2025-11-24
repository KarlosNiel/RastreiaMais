"use client";

import { Card, CardBody, Divider } from "@heroui/react";
import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { RHFChipGroup } from "@/components/form/RHFChipGroup";
import { RHFDate } from "@/components/form/RHFDate";
import { RHFInput } from "@/components/form/RHFInput";

/** ───────── helpers ───────── */
const parseDecimal = (raw: string) =>
  raw?.trim() ? Number(raw.replace(/\./g, "").replace(",", ".")) : raw;

/** Campos mínimos deste step (caso queira validar algo “macro”). */
export const STEP3_FIELDS = ["clinica"] as const;

/** Campos dinâmicos para o Wizard validar apenas o que está visível. */
export function getStep3FieldsDynamic({
  has,
  dm,
}: {
  has: boolean;
  dm: boolean;
}) {
  const base: string[] = [];

  if (has) {
    base.push(
      "clinica.has.diag_has",
      "clinica.has.usa_medicacao",
      "clinica.has.historico_familiar",
      // aferições (opcionais no schema, mas ajudam highlight de formato)
      "clinica.has.pa1_sis",
      "clinica.has.pa1_dia",
      "clinica.has.pa2_sis",
      "clinica.has.pa2_dia",
    );
  }
  if (dm) {
    base.push(
      "clinica.dm.diag_dm",
      "clinica.dm.usa_medicacao",
      "clinica.dm.historico_familiar",
    );
  }

  return base as (keyof any)[];
}

export default function Step3Clinica() {
  const { control } = useFormContext();
  const has = !!useWatch({ control, name: "condicoes.has" });
  const dm = !!useWatch({ control, name: "condicoes.dm" });

  const showEmptyHint = !has && !dm;

  return (
    <div className="space-y-6">
      <Card
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
        shadow="none"
      >
        <CardBody className="space-y-8">
          <h2 className="text-xl font-semibold">3. Avaliação Clínica</h2>

          {/* Condicionais conforme seleção do Step 2 */}
          {has && <BlocoHAS />}

          {dm && (
            <>
              {has && <Divider className="my-2" />}
              <BlocoDM />
            </>
          )}

          {showEmptyHint && (
            <p className="text-sm text-foreground-500">
              Nenhuma condição selecionada no passo 2. Marque Hipertensão e/ou
              Diabetes para habilitar os blocos clínicos.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/* ===========================
 * BLOCO — HIPERTENSÃO (HAS)
 * =========================== */
function BlocoHAS() {
  const { watch, setValue } = useFormContext();
  const complicacoes = watch("clinica.has.complicacoes") as
    | string[]
    | undefined;
  const showOutra = useMemo(
    () => complicacoes?.includes("outra"),
    [complicacoes],
  );

  // ===== Cálculo automático do IMC (HAS) =====
  const pesoHas = watch("clinica.has.peso");
  const alturaHas = watch("clinica.has.altura");

  useEffect(() => {
    try {
      const peso =
        typeof pesoHas === "string" ? parseDecimal(pesoHas) : pesoHas;
      const alturaRaw =
        typeof alturaHas === "string" ? parseDecimal(alturaHas) : alturaHas;

      const pesoNum = Number(peso);
      const alturaNum = Number(alturaRaw);

      if (!pesoNum || !alturaNum) {
        setValue("clinica.has.imc", undefined, {
          shouldDirty: true,
          shouldTouch: false,
        });

        return;
      }

      // se altura em cm (>3), converter para metros
      const alturaM = alturaNum > 3 ? alturaNum / 100 : alturaNum;

      if (alturaM <= 0) {
        setValue("clinica.has.imc", undefined, {
          shouldDirty: true,
          shouldTouch: false,
        });

        return;
      }

      const imc = pesoNum / (alturaM * alturaM);
      const imcRounded = Math.round(imc * 10) / 10;

      setValue("clinica.has.imc", imcRounded, {
        shouldDirty: true,
        shouldTouch: false,
      });
    } catch {
      // silencioso
    }
  }, [pesoHas, alturaHas, setValue]);

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Hipertensão (HAS)</h3>

      {/* Diagnóstico inicial */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Diagnóstico inicial
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <RHFChipGroup
              single
              label="Já foi diagnosticado com hipertensão?"
              name="clinica.has.diag_has"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
            />
            <RHFChipGroup
              single
              className="pb-4"
              label="Usa medicação?"
              name="clinica.has.usa_medicacao"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "irregular", label: "Irregular" },
                { value: "nao_se_aplica", label: "N.S.A." },
              ]}
            />
            <RHFInput
              label="Medicamentos (opcional)"
              name="clinica.has.medicamentos"
              placeholder="Ex.: Losartana 50mg"
            />
          </div>

          <div className="space-y-4">
            <RHFChipGroup
              single
              label="Histórico familiar"
              name="clinica.has.historico_familiar"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
            />
            <RHFChipGroup
              multiple
              label="Complicações relacionadas"
              name="clinica.has.complicacoes"
              options={[
                { value: "avc", label: "AVC" },
                { value: "infarto", label: "Infarto" },
                { value: "renal", label: "Doença renal" },
                { value: "outra", label: "Outra" },
              ]}
            />
            {showOutra && (
              <RHFInput
                label="Descrever complicação"
                name="clinica.has.complicacao_outra"
                placeholder="Ex.: Retinopatia"
              />
            )}
          </div>
        </div>
      </fieldset>

      {/* Estilo de vida + aferições/exames */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Estilo de vida e exames
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lifestyle */}
          <div className="space-y-4">
            <RHFChipGroup
              single
              label="Alimentação"
              name="clinica.has.estilo_alimentacao"
              options={[
                { value: "saudavel", label: "Saudável" },
                { value: "parcial", label: "Parcialmente saudável" },
                { value: "pouco", label: "Pouco saudável" },
              ]}
            />
            <RHFChipGroup
              single
              label="Consumo de sal"
              name="clinica.has.sal"
              options={[
                { value: "adequado", label: "Adequado" },
                { value: "exagerado", label: "Exagerado" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
            />
            <RHFChipGroup
              single
              label="Álcool"
              name="clinica.has.alcool"
              options={[
                { value: "nao_bebe", label: "Não bebe" },
                { value: "socialmente", label: "Socialmente" },
                { value: "frequentemente", label: "Frequentemente" },
              ]}
            />
            <RHFChipGroup
              single
              label="Tabagismo"
              name="clinica.has.tabagismo"
              options={[
                { value: "nunca", label: "Nunca" },
                { value: "ex", label: "Ex-fumante" },
                { value: "atual", label: "Atual" },
              ]}
            />
            <RHFChipGroup
              single
              label="Última consulta (HAS)"
              name="clinica.has.ultima_consulta_has"
              options={[
                { value: "7d", label: "7 dias" },
                { value: "15d", label: "15 dias" },
                { value: "30d", label: "30 dias" },
                { value: "60d", label: "60 dias" },
                { value: "90d", label: "90 dias" },
                { value: "6m", label: "6 meses" },
                { value: "1a", label: "1 ano" },
                { value: ">1a", label: ">1 ano" },
              ]}
            />
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PA em pares */}
            <RHFInput
              numericOnly
              inputMode="numeric"
              label="PA 1ª – Sistólica (mmHg)"
              name="clinica.has.pa1_sis"
            />
            <RHFInput
              numericOnly
              inputMode="numeric"
              label="PA 1ª – Diastólica (mmHg)"
              name="clinica.has.pa1_dia"
            />
            <RHFInput
              numericOnly
              inputMode="numeric"
              label="PA 2ª – Sistólica (mmHg)"
              name="clinica.has.pa2_sis"
            />
            <RHFInput
              numericOnly
              inputMode="numeric"
              label="PA 2ª – Diastólica (mmHg)"
              name="clinica.has.pa2_dia"
            />

            <RHFInput
              inputMode="decimal"
              label="Peso (kg)"
              name="clinica.has.peso"
              valueParser={parseDecimal}
            />
            <RHFInput
              inputMode="decimal"
              label="Altura (cm)"
              name="clinica.has.altura"
              valueParser={parseDecimal}
            />
            <RHFInput
              isReadOnly
              label="IMC (auto)"
              name="clinica.has.imc"
              placeholder="auto"
            />
            <RHFInput
              inputMode="decimal"
              label="Circ. abdominal (cm)"
              name="clinica.has.circ_abdominal"
              valueParser={parseDecimal}
            />

            <RHFInput
              inputMode="decimal"
              label="Colesterol total (mg/dL)"
              name="clinica.has.col_total"
              valueParser={parseDecimal}
            />
            <RHFDate
              label="Data col. total"
              name="clinica.has.col_total_data"
            />

            <RHFInput
              inputMode="decimal"
              label="HDL colesterol (mg/dL)"
              name="clinica.has.hdl"
              valueParser={parseDecimal}
            />
            <RHFDate label="Data HDL" name="clinica.has.hdl_data" />
          </div>
        </div>
      </fieldset>

      {/* Classificação e condutas */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Classificação e condutas
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RHFChipGroup
            single
            label="Classificação da P.A"
            name="clinica.has.classificacao_pa"
            options={[
              { value: "normal", label: "Normal" },
              { value: "pre_hipertenso", label: "Pré-hipertenso" },
              { value: "estagio1", label: "Estágio 1" },
              { value: "estagio2", label: "Estágio 2" },
              { value: "estagio3", label: "Estágio 3" },
            ]}
          />
          <RHFChipGroup
            single
            label="Score de Framingham"
            name="clinica.has.framingham"
            options={[
              { value: "<10", label: "<10% (Baixo)" },
              { value: "10-20", label: "10–20% (Moderado)" },
              { value: ">20", label: ">20% (Alto)" },
            ]}
          />

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFChipGroup
              multiple
              label="Conduta adotada"
              name="clinica.has.condutas"
              options={[
                { value: "aps", label: "Acompanhamento na APS" },
                { value: "encaminhamento", label: "Encaminhamento" },
                { value: "grupo", label: "Grupo/educação" },
                { value: "outro", label: "Outro" },
              ]}
            />
            <RHFInput
              label="Descrever (se 'Outro')"
              name="clinica.has.conduta_outro"
              placeholder="Descreva"
            />
          </div>
        </div>
      </fieldset>
    </section>
  );
}

/* ===========================
 * BLOCO — DIABETES (DM)
 * =========================== */
function BlocoDM() {
  const { watch, setValue } = useFormContext();
  const pe = watch("clinica.dm.pe_diabetico") as string | undefined;
  const showMembro = pe === "sim";

  // ===== Cálculo automático do IMC (DM) =====
  const pesoDm = watch("clinica.dm.peso");
  const alturaDm = watch("clinica.dm.altura");

  useEffect(() => {
    try {
      const peso = typeof pesoDm === "string" ? parseDecimal(pesoDm) : pesoDm;
      const alturaRaw =
        typeof alturaDm === "string" ? parseDecimal(alturaDm) : alturaDm;

      const pesoNum = Number(peso);
      const alturaNum = Number(alturaRaw);

      if (!pesoNum || !alturaNum) {
        setValue("clinica.dm.imc", undefined, {
          shouldDirty: true,
          shouldTouch: false,
        });

        return;
      }

      const alturaM = alturaNum > 3 ? alturaNum / 100 : alturaNum;

      if (alturaM <= 0) {
        setValue("clinica.dm.imc", undefined, {
          shouldDirty: true,
          shouldTouch: false,
        });

        return;
      }

      const imc = pesoNum / (alturaM * alturaM);
      const imcRounded = Math.round(imc * 10) / 10;

      setValue("clinica.dm.imc", imcRounded, {
        shouldDirty: true,
        shouldTouch: false,
      });
    } catch {
      // silencioso
    }
  }, [pesoDm, alturaDm, setValue]);

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Diabetes (DM)</h3>

      {/* Diagnóstico inicial */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Diagnóstico inicial
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <RHFChipGroup
              single
              label="Já foi diagnosticado com diabetes?"
              name="clinica.dm.diag_dm"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
            />
            <RHFChipGroup
              single
              label="Usa medicação?"
              name="clinica.dm.usa_medicacao"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "irregular", label: "Irregular" },
                { value: "nao_se_aplica", label: "N.S.A." },
              ]}
            />
            <RHFChipGroup
              multiple
              className="pb-4"
              label="Tipo de tratamento"
              name="clinica.dm.tipo_tratamento"
              options={[
                { value: "medicamentoso", label: "Medicamentoso (oral)" },
                { value: "insulina", label: "Insulina" },
                { value: "alimentar", label: "Alimentar/estilo de vida" },
                { value: "outro", label: "Outro" },
              ]}
            />
            <RHFInput
              label="Medicamentos (opcional)"
              name="clinica.dm.medicamentos"
              placeholder="Descreva"
            />
          </div>

          <div className="space-y-4">
            <RHFChipGroup
              single
              label="Histórico familiar"
              name="clinica.dm.historico_familiar"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
            />
            <RHFChipGroup
              multiple
              label="Comorbidades"
              name="clinica.dm.comorbidades"
              options={[
                { value: "cardiaca", label: "Cardíaca" },
                { value: "renal", label: "Renal" },
                { value: "visual", label: "Visual" },
                { value: "vascular", label: "Vascular" },
                { value: "outra", label: "Outra" },
              ]}
            />
            <RHFChipGroup
              single
              label="Pé diabético"
              name="clinica.dm.pe_diabetico"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            {showMembro && (
              <RHFInput
                label="Membro acometido"
                name="clinica.dm.pe_diabetico_membro"
                placeholder="Ex.: D/E"
              />
            )}
          </div>
        </div>
      </fieldset>

      {/* Aferições e exames + Estilo de vida */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Aferições, exames e estilo de vida
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exames & medidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              inputMode="decimal"
              label="Glicemia capilar (aleatória)"
              name="clinica.dm.glicemia_aleatoria"
              placeholder="mg/dL"
              valueParser={parseDecimal}
            />
            <RHFInput
              inputMode="decimal"
              label="Glicemia capilar em jejum"
              name="clinica.dm.glicemia_jejum"
              placeholder="mg/dL"
              valueParser={parseDecimal}
            />
            <RHFDate
              label="Data (jejum)"
              name="clinica.dm.glicemia_jejum_data"
            />

            <RHFInput
              inputMode="decimal"
              label="Hemoglobina glicada (HbA1c)"
              name="clinica.dm.hba1c"
              placeholder="%"
              valueParser={parseDecimal}
            />
            <RHFDate label="Data HbA1c" name="clinica.dm.hba1c_data" />

            <RHFInput
              inputMode="decimal"
              label="Peso (kg)"
              name="clinica.dm.peso"
              valueParser={parseDecimal}
            />
            <RHFInput
              inputMode="decimal"
              label="Altura (cm)"
              name="clinica.dm.altura"
              valueParser={parseDecimal}
            />
            <RHFInput
              isReadOnly
              label="IMC (auto)"
              name="clinica.dm.imc"
              placeholder="auto"
            />
            <RHFInput
              inputMode="decimal"
              label="Circ. abdominal (cm)"
              name="clinica.dm.circ_abdominal"
              valueParser={parseDecimal}
            />
          </div>

          {/* Lifestyle */}
          <div className="space-y-4">
            <RHFChipGroup
              single
              label="Alimentação"
              name="clinica.dm.estilo_alimentacao"
              options={[
                { value: "saudavel", label: "Saudável" },
                { value: "parcial", label: "Parcialmente saudável" },
                { value: "pouco", label: "Pouco saudável" },
              ]}
            />
            <RHFChipGroup
              single
              label="Consumo de sal"
              name="clinica.dm.sal"
              options={[
                { value: "adequado", label: "Adequado" },
                { value: "exagerado", label: "Exagerado" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
            />
            <RHFChipGroup
              single
              label="Álcool"
              name="clinica.dm.alcool"
              options={[
                { value: "nao_bebe", label: "Não bebe" },
                { value: "socialmente", label: "Socialmente" },
                { value: "frequentemente", label: "Frequentemente" },
              ]}
            />
            <RHFChipGroup
              single
              label="Tabagismo"
              name="clinica.dm.tabagismo"
              options={[
                { value: "nunca", label: "Nunca" },
                { value: "ex", label: "Ex-fumante" },
                { value: "atual", label: "Atual" },
              ]}
            />
            <RHFChipGroup
              single
              label="Última consulta (DM)"
              name="clinica.dm.ultima_consulta_dm"
              options={[
                { value: "7d", label: "7 dias" },
                { value: "15d", label: "15 dias" },
                { value: "30d", label: "30 dias" },
                { value: "60d", label: "60 dias" },
                { value: "90d", label: "90 dias" },
                { value: "6m", label: "6 meses" },
                { value: "1a", label: "1 ano" },
                { value: ">1a", label: ">1 ano" },
              ]}
            />

            <RHFChipGroup
              single
              label="Idade ≥ 45 anos"
              name="clinica.dm.risco_idade_45"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <RHFChipGroup
              single
              label="Sobrepeso/obesidade (IMC ≥ 25)"
              name="clinica.dm.risco_imc_25"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <RHFChipGroup
              single
              label="Sedentarismo"
              name="clinica.dm.risco_sedentarismo"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <RHFChipGroup
              single
              label="P.A. elevada"
              name="clinica.dm.risco_pa_elevada"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <RHFChipGroup
              single
              label="Colesterol/Triglicerídeos alterados"
              name="clinica.dm.risco_lipidios_alterados"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
            <RHFChipGroup
              single
              label="História de DM gestacional (mulheres)"
              name="clinica.dm.risco_dm_gestacional"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_se_aplica", label: "N.S.A." },
              ]}
            />
            <RHFChipGroup
              single
              label="Síndrome dos ovários policísticos (mulheres)"
              name="clinica.dm.risco_sop"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_se_aplica", label: "N.S.A." },
              ]}
            />
          </div>
        </div>
      </fieldset>

      {/* Classificação e condutas */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Classificação e condutas
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RHFChipGroup
            single
            label="Resultado da triagem"
            name="clinica.dm.triagem_dm"
            options={[
              { value: "normal", label: "Normal" },
              { value: "glicemia_alterada", label: "Glicemia alterada" },
              { value: "suspeita_dm", label: "Suspeita de DM" },
              {
                value: "diagnostico_confirmado",
                label: "Diagnóstico confirmado",
              },
            ]}
          />
          <RHFChipGroup
            multiple
            label="Conduta adotada"
            name="clinica.dm.condutas"
            options={[
              { value: "confirmacao_lab", label: "Confirmação laboratorial" },
              { value: "inicio_trat", label: "Início de tratamento" },
              { value: "orientacao", label: "Orientação/educação" },
              { value: "encaminhamento_med", label: "Encaminhamento médico" },
              { value: "outro", label: "Outro" },
            ]}
          />
          <RHFInput
            className="lg:col-span-2"
            label="Descrever (se 'Outro')"
            name="clinica.dm.conduta_outro"
            placeholder="Descreva"
          />
        </div>
      </fieldset>
    </section>
  );
}
