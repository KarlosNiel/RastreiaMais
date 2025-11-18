// frontend/components/pacientes/sections/Step1Sociodemo.tsx
"use client";

import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  Divider,
  Input,
} from "@heroui/react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { RHFChipGroup } from "@/components/form/RHFChipGroup";
import { RHFDate } from "@/components/form/RHFDate";
import { RHFInput } from "@/components/form/RHFInput";
import { RHFSelect } from "@/components/form/RHFSelect";
import { RHFSwitch } from "@/components/form/RHFSwitch";

/** ======= Consts ======= */
const UF_LIST = [
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
];

const ESCOLARIDADES = [
  { value: "fund_incompleto", label: "Fundamental incompleto" },
  { value: "fund_completo", label: "Fundamental completo" },
  { value: "medio_incompleto", label: "Médio incompleto" },
  { value: "medio_completo", label: "Médio completo" },
  { value: "sup_incompleto", label: "Sup. incompleto" },
  { value: "sup_completo", label: "Sup. completo" },
  { value: "sem_escolaridade", label: "Sem escolaridade/Analfabeto" },
];

const ESTADOS_CIVIS = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "uniao_estavel", label: "União estável" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "separado", label: "Separado(a)/Divorciado(a)" },
];

/**
 * Campos que este Step valida ao avançar
 * (use no PatientWizard.stepFields[0])
 */
export const STEP1_FIELDS = ["socio.nome", "socio.sus_cpf"] as const;

export default function Step1Sociodemo() {
  const { watch, setValue } = useFormContext();

  // campos usados aqui
  const nascimento = watch("socio.nascimento");
  const genero = watch("socio.genero");

  // idade calculada a partir do nascimento (aceita Date ou string parseável)
  const idade = useMemo(() => {
    if (!nascimento) return "";
    const d = new Date(nascimento as any);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
    return String(Math.max(0, years));
  }, [nascimento]);

  const UF_OPTIONS = useMemo(
    () => UF_LIST.map((uf) => ({ key: uf, label: uf })),
    []
  );

  return (
    <div className="space-y-6">
      <Card
        shadow="none"
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
      >
        <CardBody className="space-y-6">
          <h2 className="text-xl font-semibold">1. Dados Sociodemográficos</h2>

          {/* 1) Identificação */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Identificação
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <RHFInput
                className="md:col-span-7"
                name="socio.nome"
                label="Nome completo"
                placeholder="Digite o nome"
                isRequired
                autoComplete="name"
              />

              <RHFDate
                className="md:col-span-3"
                name="socio.nascimento"
                label="Nascimento"
              />

              {/* Idade: somente leitura */}
              <div className="md:col-span-2">
                <Input
                  className="w-full"
                  label="Idade"
                  labelPlacement="outside"
                  value={idade}
                  isReadOnly
                  placeholder="—"
                  aria-readonly="true"
                  endContent={
                    <span className="text-foreground/60 text-sm">anos</span>
                  }
                  classNames={{
                    label: "text-sm mb-1",
                    input: "text-right tabular-nums",
                    inputWrapper: "dark:bg-gray-800",
                  }}
                />
              </div>

              <div className="md:col-span-4">
                <RHFChipGroup
                  name="socio.genero"
                  label="Gênero"
                  single
                  className="mt-1"
                  chipsClassName="flex flex-wrap gap-2"
                  options={[
                    { value: "M", label: "M" },
                    { value: "F", label: "F" },
                    { value: "O", label: "Outro" },
                  ]}
                  onValueChange={(v) => {
                    setValue("socio.genero", v as any, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    if (v !== "O") setValue("socio.genero_outro", "");
                  }}
                />
              </div>

              {genero === "O" && (
                <RHFInput
                  className="md:col-span-4"
                  name="socio.genero_outro"
                  label="Descrever gênero"
                  placeholder="Ex.: Não-binário"
                />
              )}

              <RHFSelect
                className="md:col-span-4"
                name="socio.raca_etnia"
                label="Raça/Etnia"
                placeholder="Selecione"
                options={[
                  { key: "branca", label: "Branca" },
                  { key: "preta", label: "Preta" },
                  { key: "parda", label: "Parda" },
                  { key: "amarela", label: "Amarela" },
                  { key: "indigena", label: "Indígena" },
                  { key: "nao_informado", label: "Não informado" },
                ]}
              />

              <RHFInput
                className="md:col-span-4"
                name="socio.sus_cpf"
                label="SUS/CPF"
                placeholder="000.000.000-00"
                isRequired
                inputMode="numeric"
                numericOnly
                autoComplete="off"
              />
            </div>
          </section>

          <Divider />

          {/* 2) Contato & Endereço */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Contato & Endereço
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <RHFInput
                className="md:col-span-6"
                name="socio.endereco.logradouro"
                label="Endereço"
                placeholder="Rua, Número"
                autoComplete="address-line1"
              />
              <RHFInput
                className="md:col-span-3"
                name="socio.endereco.bairro"
                label="Bairro"
                placeholder="Ex.: Centro"
                autoComplete="address-level3"
              />
              <RHFInput
                className="md:col-span-2"
                name="socio.endereco.cidade"
                label="Cidade"
                placeholder="Ex.: Patos"
                autoComplete="address-level2"
              />
              <RHFSelect
                className="md:col-span-1"
                name="socio.endereco.uf"
                label="UF"
                placeholder="UF"
                options={UF_OPTIONS}
              />

              <RHFInput
                className="md:col-span-3"
                name="socio.endereco.cep"
                label="CEP"
                placeholder="00000-000"
                inputMode="numeric"
                numericOnly
                autoComplete="postal-code"
              />
              <RHFInput
                className="md:col-span-3"
                name="socio.telefone"
                label="Telefone"
                placeholder="(00) 00000-0000"
                inputMode="tel"
                autoComplete="tel"
              />
              <div className="md:col-span-2 flex items-end">
                <RHFSwitch name="socio.whatsapp" label="WhatsApp" />
              </div>
            </div>
          </section>

          <Divider />

          {/* 3) ACS responsável — texto livre */}
          <section className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <RHFInput
                className="md:col-span-6"
                name="socio.acs_responsavel"
                label="ACS Responsável"
                placeholder="Nome do ACS"
                autoComplete="off"
              />
            </div>
          </section>

          <Divider />

          {/* 4) Família & Renda (colapsável) */}
          <Accordion
            selectionMode="multiple"
            defaultSelectedKeys={["famrenda"]}
            className="-mt-2"
          >
            <AccordionItem
              key="famrenda"
              aria-label="Família & Renda"
              title="Família & Renda"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <RHFInput
                  className="md:col-span-3"
                  name="socio.n_pessoas_domicilio"
                  label="Nº de pessoas no domicílio"
                  placeholder="Ex.: 4"
                  inputMode="numeric"
                  numericOnly
                />
                <RHFInput
                  className="md:col-span-4"
                  name="socio.responsavel_familiar"
                  label="Responsável familiar"
                  placeholder="Nome do responsável"
                />
                <RHFInput
                  className="md:col-span-3"
                  name="socio.renda_familiar"
                  label="Renda familiar"
                  placeholder="R$ 0,00"
                  inputMode="decimal"
                />
                <div className="md:col-span-2 flex items-end">
                  <RHFSwitch name="socio.bolsa_familia" label="Bolsa família" />
                </div>
              </div>
            </AccordionItem>
          </Accordion>

          {/* 5) Escolaridade & Ocupação */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Escolaridade & Ocupação
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <RHFChipGroup
                  name="socio.escolaridade"
                  label="Escolaridade"
                  single
                  className="mt-1"
                  chipsClassName="flex flex-wrap gap-2"
                  options={ESCOLARIDADES}
                />
              </div>
              <RHFInput
                className="md:col-span-4"
                name="socio.ocupacao"
                label="Ocupação"
                placeholder="Ex.: Pedreiro, Professora, Estudante"
                autoComplete="organization-title"
              />
            </div>
          </section>

          <Divider />

          {/* 6) Estado civil */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Estado civil
            </h3>
            <div className="md:col-span-12">
              <RHFChipGroup
                name="socio.estado_civil"
                label=""
                single
                className="mt-1"
                chipsClassName="flex flex-wrap gap-2"
                options={ESTADOS_CIVIS}
              />
            </div>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
