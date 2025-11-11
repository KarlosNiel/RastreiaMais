// frontend/components/pacientes/sections/Step4Multiprof.tsx
"use client";

import { RHFChipGroup } from "@/components/form/RHFChipGroup";
import { RHFInput } from "@/components/form/RHFInput";
import { Card, CardBody, Divider } from "@heroui/react";
import { useFormContext } from "react-hook-form";

/** Campos deste passo (útil para validação dirigida no Wizard) */
export const STEP4_FIELDS = ["multiprof"] as const;

export default function Step4Multiprof() {
  const { watch } = useFormContext();

  // condicionais
  const usoPsico = watch("multiprof.psico_uso_psicofarmaco");
  const diagPsico = watch("multiprof.psico_diagnostico");
  const animaisCasa = watch("multiprof.ambi_animais_domicilio");
  const praticaAF = watch("multiprof.fisico_atividade");
  const precisaEnc = watch("multiprof.precisa_enc_multiprof");
  const encMultiprof = watch("multiprof.enc_multiprof") as string[] | undefined;

  return (
    <div className="space-y-6">
      <Card shadow="none" className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2">
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
                  name="multiprof.psico_uso_psicofarmaco"
                  label="Faz uso de medicamento psicofármaco (ansiolítico, antidepressivo, etc.)?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                {usoPsico === "sim" && (
                  <RHFInput
                    name="multiprof.psico_psicofarmaco_qual"
                    label=""
                    labelPlacement="outside"
                    placeholder="Ex.: Antidepressivo."
                  />
                )}

                <RHFChipGroup
                  name="multiprof.psico_diagnostico"
                  label="Possui algum diagnóstico psicológico/psiquiátrico?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
                {diagPsico === "sim" && (
                  <RHFInput
                    name="multiprof.psico_diagnostico_qual"
                    label=""
                    labelPlacement="outside"
                    placeholder="Ex.: Depressão"
                  />
                )}
              </div>

              <div className="space-y-4">
                <RHFChipGroup
                  name="multiprof.psico_estresse_interfere"
                  label="O estresse do dia a dia interfere no controle de sua pressão/glicemia?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />

                <RHFChipGroup
                  name="multiprof.psico_fatores_economicos"
                  label="Fatores econômicos interferem na continuidade do seu tratamento?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />

                <RHFChipGroup
                  name="multiprof.psico_apoio_suficiente"
                  label="Você sente que recebe apoio suficiente de sua família/amigos para manter o tratamento?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />

                <RHFChipGroup
                  name="multiprof.psico_cumpre_orientacoes"
                  label="Você cumpre regularmente as orientações de saúde (meditação, alimentação, atividade física, etc.)?"
                  single
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
                  name="multiprof.ambi_animais_domicilio"
                  label="Presença de animais domésticos no domicílio?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
                {animaisCasa === "sim" && (
                  <RHFInput
                    name="multiprof.ambi_animais_quais"
                    label=""
                    labelPlacement="outside"
                    placeholder="Ex.: cachorro, gato"
                  />
                )}

                <RHFChipGroup
                  name="multiprof.ambi_feridas_demoram"
                  label="Você já apresentou feridas que demoram a cicatrizar após arranhões ou mordidas de animais?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />

                <RHFChipGroup
                  name="multiprof.ambi_animais_vacinados"
                  label="Seus animais estão vacinados (ex.: antirrábica, múltipla, etc.)?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />
              </div>

              <div className="space-y-4">
                <RHFChipGroup
                  name="multiprof.ambi_doencas_transmissiveis"
                  label="Você ou alguém em sua casa já foi diagnosticado com alguma doença transmissível?"
                  multiple
                  chipsClassName="flex flex-wrap gap-2"
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
                  name="multiprof.ambi_doencas_outro"
                  label=""
                  labelPlacement="outside"
                  placeholder="Alguma outra?"
                />

                <RHFChipGroup
                  name="multiprof.ambi_contato_sangue_fezes_urina"
                  label="Você costuma ter contato direto com sangue, fezes ou urina de animais?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_sabe", label: "Não sabe" },
                  ]}
                />

                <RHFChipGroup
                  name="multiprof.ambi_orientacao_zoonoses"
                  label="Já recebeu orientação sobre zoonoses durante seu acompanhamento de saúde?"
                  single
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
                  name="multiprof.fisico_atividade"
                  label="Realiza alguma atividade física?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                {praticaAF === "sim" && (
                  <RHFInput
                    name="multiprof.fisico_atividade_freq_semana"
                    label=""
                    labelPlacement="outside"
                    placeholder="Se sim, quantas vezes na semana?"
                    inputMode="numeric"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFChipGroup
                  name="multiprof.fisico_edemas"
                  label="Apresenta edemas?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                <RHFChipGroup
                  name="multiprof.fisico_dispneia"
                  label="Apresenta dispneia?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                <RHFChipGroup
                  name="multiprof.fisico_formigamento_caimbras"
                  label="Apresenta queixas como formigamento, câimbras?"
                  single
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
                <RHFChipGroup
                  name="multiprof.fisico_dificuldade_caminhar"
                  label="Apresenta dificuldade para caminhar ou realizar alguma atividade?"
                  single
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
                name="multiprof.precisa_enc_multiprof"
                label="Necessita encaminhamento multiprofissional?"
                single
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
              />

              {precisaEnc === "sim" && (
                <>
                  <RHFChipGroup
                    name="multiprof.enc_multiprof"
                    label="Se sim, para qual (múltipla escolha)?"
                    multiple
                    chipsClassName="flex flex-wrap gap-2"
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
                      name="multiprof.enc_multiprof_outro"
                      label="Outro?"
                      labelPlacement="outside"
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
