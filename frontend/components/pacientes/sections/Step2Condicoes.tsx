// frontend/components/pacientes/sections/Step2Condicoes.tsx
"use client";

import { RHFChipGroup } from "@/components/form/RHFChipGroup";
import { Card, CardBody, Checkbox, Divider, Input } from "@heroui/react";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

/** Campos validados neste passo  */
export const STEP2_FIELDS = [
  "condicoes.has",
  "condicoes.dm",
  "condicoes.outras_dcnts",
  "condicoes.outras_em_acompanhamento",
] as const;

export default function Step2Condicoes() {
  const { control, watch, setValue } = useFormContext();

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "condicoes.has" && values?.condicoes?.has === false) {
        // limpa todos os campos clínicos de HAS
        setValue("clinica.has", undefined, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      if (name === "condicoes.dm" && values?.condicoes?.dm === false) {
        // idem para DM
        setValue("clinica.dm", undefined, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return (
    <div className="space-y-6">
      <Card
        shadow="none"
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
      >
        <CardBody className="space-y-6">
          <h2 className="text-xl font-semibold">2. Condições Crônicas</h2>

          {/* HAS / DM */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Condições principais
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-12 flex flex-wrap gap-7 py-2">
                <Controller
                  name="condicoes.has"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={!!field.value}
                      onValueChange={field.onChange}
                      classNames={{
                        base: "px-3 py-2 rounded-xl border-none border-default-200 bg-gray-100 dark:bg-gray-800 hover:bg-content2 transition-colors",
                        label: "font-medium",
                        wrapper: "bg-gray-100 dark:bg-gray-800",
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
                        base: "px-3 py-2 rounded-xl border-none border-default-200 bg-gray-100 dark:bg-gray-800 hover:bg-content2 transition-colors",
                        label: "font-medium",
                        wrapper: "bg-gray-100 dark:bg-gray-800",
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
                    classNames={{
                      inputWrapper: "dark:bg-gray-800",
                    }}
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
