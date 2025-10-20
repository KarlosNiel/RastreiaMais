// frontend/components/pacientes/sections/Step2Condicoes.tsx
"use client";

import { RHFChipGroup } from "@/components/form/RHFChipGroup";
import { Card, CardBody, Checkbox, Divider, Input } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

/** Campos validados neste passo (use no PatientWizard.stepFields[1]) */
export const STEP2_FIELDS = [
  "condicoes.has",
  "condicoes.dm",
  // Mantemos o outras_dcnts para a regra do Zod (HAS/DM ou outra),
  // mas ele é opcional; com o Controller abaixo o value nunca vira undefined.
  "condicoes.outras_dcnts",
  "condicoes.outras_em_acompanhamento",
] as const;

export default function Step2Condicoes() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <Card shadow="none" className="border border-default-200">
        <CardBody className="space-y-6">
          <h2 className="text-xl font-semibold">2. Condições Crônicas</h2>

          {/* HAS / DM */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Condições principais
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-12 flex flex-wrap gap-3">
                <Controller
                  name="condicoes.has"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={!!field.value}
                      onValueChange={field.onChange}
                      classNames={{
                        base: "px-3 py-2 rounded-xl border border-default-200 bg-content1 hover:bg-content2 transition-colors",
                        label: "font-medium",
                      }}
                    >
                      Hipertensão Arterial
                    </Checkbox>
                  )}
                />
                <Controller
                  name="condicoes.dm"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={!!field.value}
                      onValueChange={field.onChange}
                      classNames={{
                        base: "px-3 py-2 rounded-xl border border-default-200 bg-content1 hover:bg-content2 transition-colors",
                        label: "font-medium",
                      }}
                    >
                      Diabetes Mellitus
                    </Checkbox>
                  )}
                />
              </div>
            </div>

            <p className="text-xs text-foreground/60">
              O passo 3 (Clínica) é exibido conforme as marcações acima.
            </p>
          </section>

          <Divider />

          {/* Outras DCNTs */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Outras DCNTs
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {/* Usamos Controller + Input direto para garantir value string */}
              <Controller
                name="condicoes.outras_dcnts"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    className="md:col-span-8"
                    label="Descrever (opcional)"
                    placeholder="Ex.: Asma, DPOC, Doença renal crônica"
                    description={
                      fieldState.error
                        ? undefined
                        : "Separe por vírgulas. Preencha aqui caso não marque HAS/DM."
                    }
                    value={field.value ?? ""} // <- nunca undefined
                    onValueChange={(v) => field.onChange(v)}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <div className="md:col-span-4">
                <RHFChipGroup
                  name="condicoes.outras_em_acompanhamento"
                  label="Em acompanhamento?"
                  single
                  className="mt-1"
                  chipsClassName="flex flex-wrap gap-2"
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                    { value: "nao_se_aplica", label: "N.S.A." },
                  ]}
                />
              </div>
            </div>

            <p className="text-xs text-foreground/60">
              É necessário marcar HAS/DM ou informar ao menos uma outra condição
              para continuar.
            </p>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
