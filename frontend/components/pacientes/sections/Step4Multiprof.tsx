// frontend/components/pacientes/sections/Step4Multiprof.tsx
"use client";

import { Card, CardBody, Divider } from "@heroui/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { RHFInput } from "@/components/form/RHFInput";
import { RHFChipGroup } from "@/components/form/RHFChipGroup";

/** Campos deste passo (útil para validação dirigida no Wizard) */
export const STEP4_FIELDS = ["multiprof"] as const;

export default function Step4Multiprof() {
  const { watch, setValue } = useFormContext();

  // condicionais
  const usoPsico = watch("multiprof.psico_uso_psicofarmaco");
  const diagPsico = watch("multiprof.psico_diagnostico");
  const animaisCasa = watch("multiprof.ambi_animais_domicilio");
  const praticaAF = watch("multiprof.fisico_atividade");
  const precisaEnc = watch("multiprof.precisa_enc_multiprof");
  const encMultiprof = watch("multiprof.enc_multiprof") as string[] | undefined;

  useEffect(() => {
    if (precisaEnc !== "sim") {
      setValue("multiprof.enc_multiprof", []);
      setValue("multiprof.enc_multiprof_outro", "");
    }
  }, [precisaEnc, setValue]);

  useEffect(() => {
    if (usoPsico !== "sim") {
      setValue("multiprof.psico_psicofarmaco_qual", "");
    }
  }, [usoPsico, setValue]);

  // Limpa diagnóstico quando voltar de "sim" para outro
  useEffect(() => {
    if (diagPsico !== "sim") {
      setValue("multiprof.psico_diagnostico_qual", "");
    }
  }, [diagPsico, setValue]);

  // Limpa "quais animais" quando não há animais no domicílio
  useEffect(() => {
    if (animaisCasa !== "sim") {
      setValue("multiprof.ambi_animais_quais", "");
    }
  }, [animaisCasa, setValue]);

  // Limpa frequência de AF quando a resposta é "não"
  useEffect(() => {
    if (praticaAF !== "sim") {
      setValue("multiprof.fisico_atividade_freq_semana", undefined);
    }
  }, [praticaAF, setValue]);

  return (
    <div className="space-y-6">
      <Card
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
        shadow="none"
      >
        <CardBody className="space-y-8">
          <h2 className="text-xl font-semibold">
            4. Avaliação Multiprofissional
          </h2>

          {/* Riscos Psicossociais */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">
              Riscos psicossociais
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl border border-default-200 p-4">
              <div className="space-y-4">
                <RHFChipGroup
                  single
                  label="Faz uso de medicamento psicofármaco (ansiolítico, antidepressivo, etc.)?"
                  name="multiprof.psico_uso_psicofarmaco"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                {usoPsico === "sim" && (
                  <RHFInput
                    label=""
                    labelPlacement="outside"
                    name="multiprof.psico_psicofarmaco_qual"
                    placeholder="Ex.: Antidepressivo."
                  />
                )}

                <RHFChipGroup
                  single
                  label="Possui algum diagnóstico psicológico/psiquiátrico?"
                  name="multiprof.psico_diagnostico"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
                {diagPsico === "sim" && (
                  <RHFInput
                    label=""
                    labelPlacement="outside"
                    name="multiprof.psico_diagnostico_qual"
                    placeholder="Ex.: Depressão"
                  />
                )}
              </div>

              <div className="space-y-4">
                <RHFChipGroup
                  single
                  label="O estresse do dia a dia interfere no controle de sua pressão/glicemia?"
                  name="multiprof.psico_estresse_interfere"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />

                <RHFChipGroup
                  single
                  label="Fatores econômicos interferem na continuidade do seu tratamento?"
                  name="multiprof.psico_fatores_economicos"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />

                <RHFChipGroup
                  single
                  label="Você sente que recebe apoio suficiente de sua família/amigos para manter o tratamento?"
                  name="multiprof.psico_apoio_suficiente"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />

                <RHFChipGroup
                  single
                  label="Você cumpre regularmente as orientações de saúde (meditação, alimentação, atividade física, etc.)?"
                  name="multiprof.psico_cumpre_orientacoes"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
              </div>
            </div>
          </section>

          <Divider />

          {/* Riscos Ambientais */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">
              Riscos ambientais
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl border border-default-200 p-4">
              <div className="space-y-4">
                <RHFChipGroup
                  single
                  label="Presença de animais domésticos no domicílio?"
                  name="multiprof.ambi_animais_domicilio"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
                {animaisCasa === "sim" && (
                  <RHFInput
                    label=""
                    labelPlacement="outside"
                    name="multiprof.ambi_animais_quais"
                    placeholder="Ex.: cachorro, gato"
                  />
                )}

                <RHFChipGroup
                  single
                  label="Você já apresentou feridas que demoram a cicatrizar após arranhões ou mordidas de animais?"
                  name="multiprof.ambi_feridas_demoram"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />

                <RHFChipGroup
                  single
                  label="Seus animais estão vacinados (ex.: antirrábica, múltipla, etc.)?"
                  name="multiprof.ambi_animais_vacinados"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
              </div>

              <div className="space-y-4">
                <RHFChipGroup
                  multiple
                  chipsClassName="flex flex-wrap gap-2"
                  label="Você ou alguém em sua casa já foi diagnosticado com alguma doença transmissível?"
                  name="multiprof.ambi_doencas_transmissiveis"
                  options={[
                    { value: "chagas", label: "D. de Chagas" },
                    { value: "leishmaniose", label: "Leishmaniose" },
                    { value: "tuberculose", label: "Tuberculose" },
                    { value: "toxoplasmose", label: "Toxoplasmose" },
                    { value: "esporotricose", label: "Esporotricose" },
                    { value: "hanseniase", label: "Hanseníase" },
                  ]}
                />
                <RHFInput
                  label=""
                  labelPlacement="outside"
                  name="multiprof.ambi_doencas_outro"
                  placeholder="Alguma outra?"
                />

                <RHFChipGroup
                  single
                  label="Você costuma ter contato direto com sangue, fezes ou urina de animais?"
                  name="multiprof.ambi_contato_sangue_fezes_urina"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />

                <RHFChipGroup
                  single
                  label="Já recebeu orientação sobre zoonoses durante seu acompanhamento de saúde?"
                  name="multiprof.ambi_orientacao_zoonoses"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
              </div>
            </div>
          </section>

          <Divider />

          {/* Riscos físico-motores */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">
              Riscos físico-motores
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl border border-default-200 p-4">
              <div className="space-y-4">
                <RHFChipGroup
                  single
                  label="Realiza alguma atividade física?"
                  name="multiprof.fisico_atividade"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                {praticaAF === "sim" && (
                  <RHFInput
                    inputMode="numeric"
                    label=""
                    labelPlacement="outside"
                    name="multiprof.fisico_atividade_freq_semana"
                    placeholder="Se sim, quantas vezes na semana?"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFChipGroup
                  single
                  label="Apresenta edemas?"
                  name="multiprof.fisico_edemas"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                <RHFChipGroup
                  single
                  label="Apresenta dispneia?"
                  name="multiprof.fisico_dispneia"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                <RHFChipGroup
                  single
                  label="Apresenta queixas como formigamento, câimbras?"
                  name="multiprof.fisico_formigamento_caimbras"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                <RHFChipGroup
                  single
                  label="Apresenta dificuldade para caminhar ou realizar alguma atividade?"
                  name="multiprof.fisico_dificuldade_caminhar"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
              </div>
            </div>
          </section>

          <Divider />

          {/* Classificação e condutas */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">
              Classificação e condutas
            </h3>

            <div className="space-y-4 rounded-2xl border border-default-200 p-4">
              <RHFChipGroup
                single
                label="Necessita encaminhamento multiprofissional?"
                name="multiprof.precisa_enc_multiprof"
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
              />

              {precisaEnc === "sim" && (
                <>
                  <RHFChipGroup
                    multiple
                    chipsClassName="flex flex-wrap gap-2"
                    label="Se sim, para qual (múltipla escolha)?"
                    name="multiprof.enc_multiprof"
                    options={[
                      { value: "psicologo", label: "Psicólogo" },
                      { value: "medico_vet", label: "Médico Vet." },
                      { value: "fisioterapeuta", label: "Fisioterapeuta" },
                      {
                        value: "cirurgia_dentista",
                        label: "Cirurgião Dentista",
                      },
                      {
                        value: "assistente_social",
                        label: "Assistente Social",
                      },
                      { value: "nutricionista", label: "Nutricionista" },
                      { value: "enfermeira", label: "Enfermeira" },
                      { value: "outro", label: "Outro" },
                    ]}
                  />

                  {encMultiprof?.includes("outro") && (
                    <RHFInput
                      label="Outro?"
                      labelPlacement="outside"
                      name="multiprof.enc_multiprof_outro"
                      placeholder="Descreva"
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
