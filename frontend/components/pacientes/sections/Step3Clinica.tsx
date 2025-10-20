// frontend/components/pacientes/sections/Step3Clinica.tsx
"use client";

import { RHFChipGroup } from "@/components/form/RHFChipGroup";
import { RHFDate } from "@/components/form/RHFDate";
import { RHFInput } from "@/components/form/RHFInput";
import { Card, CardBody, Divider } from "@heroui/react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

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
      "clinica.has.pa2_dia"
    );
  }
  if (dm) {
    base.push(
      "clinica.dm.diag_dm",
      "clinica.dm.usa_medicacao",
      "clinica.dm.historico_familiar"
    );
  }
  return base as (keyof any)[];
}

export default function Step3Clinica() {
  const { watch } = useFormContext();
  const has = !!watch("condicoes.has");
  const dm = !!watch("condicoes.dm");

  const showEmptyHint = !has && !dm;

  return (
    <div className="space-y-6">
      <Card shadow="none" className="border border-default-200">
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
  const { watch } = useFormContext();
  const complicacoes = watch("clinica.has.complicacoes") as
    | string[]
    | undefined;
  const showOutra = useMemo(
    () => complicacoes?.includes("outra"),
    [complicacoes]
  );

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
              name="clinica.has.diag_has"
              label="Já foi diagnosticado com hipertensão?"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.has.usa_medicacao"
              label="Usa medicação?"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "irregular", label: "Irregular" },
                { value: "nao_se_aplica", label: "N.S.A." },
              ]}
              single
            />
            <RHFInput
              name="clinica.has.medicamentos"
              label="Medicamentos (opcional)"
              placeholder="Ex.: Losartana 50mg"
            />
          </div>

          <div className="space-y-4">
            <RHFChipGroup
              name="clinica.has.historico_familiar"
              label="Histórico familiar"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.has.complicacoes"
              label="Complicações relacionadas"
              options={[
                { value: "avc", label: "AVC" },
                { value: "infarto", label: "Infarto" },
                { value: "renal", label: "Doença renal" },
                { value: "outra", label: "Outra" },
              ]}
              multiple
            />
            {showOutra && (
              <RHFInput
                name="clinica.has.complicacao_outra"
                label="Descrever complicação"
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
              name="clinica.has.estilo_alimentacao"
              label="Alimentação"
              options={[
                { value: "saudavel", label: "Saudável" },
                { value: "parcial", label: "Parcialmente saudável" },
                { value: "pouco", label: "Pouco saudável" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.has.sal"
              label="Consumo de sal"
              options={[
                { value: "adequado", label: "Adequado" },
                { value: "exagerado", label: "Exagerado" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.has.alcool"
              label="Álcool"
              options={[
                { value: "nao_bebe", label: "Não bebe" },
                { value: "socialmente", label: "Socialmente" },
                { value: "frequentemente", label: "Frequentemente" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.has.tabagismo"
              label="Tabagismo"
              options={[
                { value: "nunca", label: "Nunca" },
                { value: "ex", label: "Ex-fumante" },
                { value: "atual", label: "Atual" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.has.ultima_consulta_has"
              label="Última consulta (HAS)"
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
              single
            />
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PA em pares */}
            <RHFInput
              name="clinica.has.pa1_sis"
              label="PA 1ª – Sistólica (mmHg)"
              inputMode="numeric"
              numericOnly
            />
            <RHFInput
              name="clinica.has.pa1_dia"
              label="PA 1ª – Diastólica (mmHg)"
              inputMode="numeric"
              numericOnly
            />
            <RHFInput
              name="clinica.has.pa2_sis"
              label="PA 2ª – Sistólica (mmHg)"
              inputMode="numeric"
              numericOnly
            />
            <RHFInput
              name="clinica.has.pa2_dia"
              label="PA 2ª – Diastólica (mmHg)"
              inputMode="numeric"
              numericOnly
            />

            <RHFInput
              name="clinica.has.peso"
              label="Peso (kg)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFInput
              name="clinica.has.altura"
              label="Altura (m)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFInput
              name="clinica.has.imc"
              label="IMC (auto)"
              isReadOnly
              placeholder="auto"
            />
            <RHFInput
              name="clinica.has.circ_abdominal"
              label="Circ. abdominal (cm)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />

            <RHFInput
              name="clinica.has.col_total"
              label="Colesterol total (mg/dL)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFDate
              name="clinica.has.col_total_data"
              label="Data col. total"
            />

            <RHFInput
              name="clinica.has.hdl"
              label="HDL colesterol (mg/dL)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFDate name="clinica.has.hdl_data" label="Data HDL" />
          </div>
        </div>
      </fieldset>

      {/* Fatores de risco (DM) */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Fatores de risco para Diabetes
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RHFChipGroup
            name="clinica.dm.risco_idade_45"
            label="Idade ≥ 45 anos"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.risco_imc_25"
            label="Sobrepeso/obesidade (IMC ≥ 25)"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.risco_sedentarismo"
            label="Sedentarismo"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.risco_pa_elevada"
            label="P.A. elevada"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.risco_lipidios_alterados"
            label="Colesterol/Triglicerídeos alterados"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.risco_dm_gestacional"
            label="História de DM gestacional (mulheres)"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
              { value: "nao_se_aplica", label: "N.S.A." },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.risco_sop"
            label="Síndrome dos ovários policísticos (mulheres)"
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
              { value: "nao_se_aplica", label: "N.S.A." },
            ]}
            single
          />
        </div>
      </fieldset>

      {/* Classificação e condutas */}
      <fieldset className="rounded-2xl border border-default-200 p-4">
        <legend className="px-1 text-sm font-medium text-foreground/70">
          Classificação e condutas
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RHFChipGroup
            name="clinica.has.classificacao_pa"
            label="Classificação da P.A"
            options={[
              { value: "normal", label: "Normal" },
              { value: "pre_hipertenso", label: "Pré-hipertenso" },
              { value: "estagio1", label: "Estágio 1" },
              { value: "estagio2", label: "Estágio 2" },
              { value: "estagio3", label: "Estágio 3" },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.has.framingham"
            label="Score de Framingham"
            options={[
              { value: "<10", label: "<10% (Baixo)" },
              { value: "10-20", label: "10–20% (Moderado)" },
              { value: ">20", label: ">20% (Alto)" },
            ]}
            single
          />

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFChipGroup
              name="clinica.has.condutas"
              label="Conduta adotada"
              options={[
                { value: "aps", label: "Acompanhamento na APS" },
                { value: "encaminhamento", label: "Encaminhamento" },
                { value: "grupo", label: "Grupo/educação" },
                { value: "outro", label: "Outro" },
              ]}
              multiple
            />
            <RHFInput
              name="clinica.has.conduta_outro"
              label="Descrever (se 'Outro')"
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
  const { watch } = useFormContext();
  const pe = watch("clinica.dm.pe_diabetico") as string | undefined;
  const showMembro = pe === "sim";

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
              name="clinica.dm.diag_dm"
              label="Já foi diagnosticado com diabetes?"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.usa_medicacao"
              label="Usa medicação?"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "irregular", label: "Irregular" },
                { value: "nao_se_aplica", label: "N.S.A." },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.tipo_tratamento"
              label="Tipo de tratamento"
              options={[
                { value: "medicamentoso", label: "Medicamentoso (oral)" },
                { value: "insulina", label: "Insulina" },
                { value: "alimentar", label: "Alimentar/estilo de vida" },
                { value: "outro", label: "Outro" },
              ]}
              multiple
            />
            <RHFInput
              name="clinica.dm.medicamentos"
              label="Medicamentos (opcional)"
              placeholder="Descreva"
            />
          </div>

          <div className="space-y-4">
            <RHFChipGroup
              name="clinica.dm.historico_familiar"
              label="Histórico familiar"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.comorbidades"
              label="Comorbidades"
              options={[
                { value: "cardiaca", label: "Cardíaca" },
                { value: "renal", label: "Renal" },
                { value: "visual", label: "Visual" },
                { value: "vascular", label: "Vascular" },
                { value: "outra", label: "Outra" },
              ]}
              multiple
            />
            <RHFChipGroup
              name="clinica.dm.pe_diabetico"
              label="Pé diabético"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
              single
            />
            {showMembro && (
              <RHFInput
                name="clinica.dm.pe_diabetico_membro"
                label="Membro acometido"
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
              name="clinica.dm.glicemia_aleatoria"
              label="Glicemia capilar (aleatória)"
              placeholder="mg/dL"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFInput
              name="clinica.dm.glicemia_jejum"
              label="Glicemia capilar em jejum"
              placeholder="mg/dL"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFDate
              name="clinica.dm.glicemia_jejum_data"
              label="Data (jejum)"
            />

            <RHFInput
              name="clinica.dm.hba1c"
              label="Hemoglobina glicada (HbA1c)"
              placeholder="%"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFDate name="clinica.dm.hba1c_data" label="Data HbA1c" />

            <RHFInput
              name="clinica.dm.peso"
              label="Peso (kg)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFInput
              name="clinica.dm.altura"
              label="Altura (m)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
            <RHFInput
              name="clinica.dm.imc"
              label="IMC (auto)"
              isReadOnly
              placeholder="auto"
            />
            <RHFInput
              name="clinica.dm.circ_abdominal"
              label="Circ. abdominal (cm)"
              inputMode="decimal"
              valueParser={parseDecimal}
            />
          </div>

          {/* Lifestyle */}
          <div className="space-y-4">
            <RHFChipGroup
              name="clinica.dm.estilo_alimentacao"
              label="Alimentação"
              options={[
                { value: "saudavel", label: "Saudável" },
                { value: "parcial", label: "Parcialmente saudável" },
                { value: "pouco", label: "Pouco saudável" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.sal"
              label="Consumo de sal"
              options={[
                { value: "adequado", label: "Adequado" },
                { value: "exagerado", label: "Exagerado" },
                { value: "nao_sabe", label: "Não sabe" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.alcool"
              label="Álcool"
              options={[
                { value: "nao_bebe", label: "Não bebe" },
                { value: "socialmente", label: "Socialmente" },
                { value: "frequentemente", label: "Frequentemente" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.tabagismo"
              label="Tabagismo"
              options={[
                { value: "nunca", label: "Nunca" },
                { value: "ex", label: "Ex-fumante" },
                { value: "atual", label: "Atual" },
              ]}
              single
            />
            <RHFChipGroup
              name="clinica.dm.ultima_consulta_dm"
              label="Última consulta (DM)"
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
              single
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
            name="clinica.dm.triagem_dm"
            label="Resultado da triagem"
            options={[
              { value: "normal", label: "Normal" },
              { value: "glicemia_alterada", label: "Glicemia alterada" },
              { value: "suspeita_dm", label: "Suspeita de DM" },
              {
                value: "diagnostico_confirmado",
                label: "Diagnóstico confirmado",
              },
            ]}
            single
          />
          <RHFChipGroup
            name="clinica.dm.condutas"
            label="Conduta adotada"
            options={[
              { value: "confirmacao_lab", label: "Confirmação laboratorial" },
              { value: "inicio_trat", label: "Início de tratamento" },
              { value: "orientacao", label: "Orientação/educação" },
              { value: "encaminhamento_med", label: "Encaminhamento médico" },
              { value: "outro", label: "Outro" },
            ]}
            multiple
          />
          <RHFInput
            name="clinica.dm.conduta_outro"
            label="Descrever (se 'Outro')"
            placeholder="Descreva"
            className="lg:col-span-2"
          />
        </div>
      </fieldset>
    </section>
  );
}
