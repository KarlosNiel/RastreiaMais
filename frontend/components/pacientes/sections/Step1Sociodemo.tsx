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
    [],
  );

  return (
    <div className="space-y-6">
      <Card
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
        shadow="none"
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
                isRequired
                autoComplete="name"
                className="md:col-span-7"
                label="Nome completo"
                name="socio.nome"
                placeholder="Digite o nome"
              />

              <RHFDate
                className="md:col-span-3"
                label="Nascimento"
                name="socio.nascimento"
              />

              {/* Idade: somente leitura */}
              <div className="md:col-span-2">
                <Input
                  isReadOnly
                  aria-readonly="true"
                  className="w-full"
                  classNames={{
                    label: "text-sm mb-1",
                    input: "text-right tabular-nums",
                    inputWrapper: "dark:bg-gray-800",
                  }}
                  endContent={
                    <span className="text-foreground/60 text-sm">anos</span>
                  }
                  label="Idade"
                  labelPlacement="outside"
                  placeholder="—"
                  value={idade}
                />
              </div>

              <div className="md:col-span-4">
                <RHFChipGroup
                  single
                  chipsClassName="flex flex-wrap gap-2"
                  className="mt-1"
                  label="Gênero"
                  name="socio.genero"
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
                  label="Descrever gênero"
                  name="socio.genero_outro"
                  placeholder="Ex.: Não-binário"
                />
              )}

              <RHFSelect
                className="md:col-span-4"
                label="Raça/Etnia"
                name="socio.raca_etnia"
                options={[
                  { key: "branca", label: "Branca" },
                  { key: "preta", label: "Preta" },
                  { key: "parda", label: "Parda" },
                  { key: "amarela", label: "Amarela" },
                  { key: "indigena", label: "Indígena" },
                  { key: "nao_informado", label: "Não informado" },
                ]}
                placeholder="Selecione"
              />

              <RHFInput
                isRequired
                numericOnly
                autoComplete="off"
                className="md:col-span-4"
                inputMode="numeric"
                label="SUS/CPF"
                name="socio.sus_cpf"
                placeholder="000.000.000-00"
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
                autoComplete="address-line1"
                className="md:col-span-6"
                label="Endereço"
                name="socio.endereco.logradouro"
                placeholder="Rua, Número"
              />
              <RHFInput
                autoComplete="address-level3"
                className="md:col-span-3"
                label="Bairro"
                name="socio.endereco.bairro"
                placeholder="Ex.: Centro"
              />
              <RHFInput
                autoComplete="address-level2"
                className="md:col-span-2"
                label="Cidade"
                name="socio.endereco.cidade"
                placeholder="Ex.: Patos"
              />
              <RHFSelect
                className="md:col-span-1"
                label="UF"
                name="socio.endereco.uf"
                options={UF_OPTIONS}
                placeholder="UF"
              />

              <RHFInput
                numericOnly
                autoComplete="postal-code"
                className="md:col-span-3"
                inputMode="numeric"
                label="CEP"
                name="socio.endereco.cep"
                placeholder="00000-000"
              />
              <RHFInput
                autoComplete="tel"
                className="md:col-span-3"
                inputMode="tel"
                label="Telefone"
                name="socio.telefone"
                placeholder="(00) 00000-0000"
              />
              <div className="md:col-span-2 flex items-end">
                <RHFSwitch label="WhatsApp" name="socio.whatsapp" />
              </div>
            </div>
          </section>

          <Divider />

          {/* 3) ACS responsável — texto livre */}
          <section className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <RHFInput
                autoComplete="off"
                className="md:col-span-6"
                label="ACS Responsável"
                name="socio.acs_responsavel"
                placeholder="Nome do ACS"
              />
            </div>
          </section>

          <Divider />

          {/* 4) Família & Renda (colapsável) */}
          <Accordion
            className="-mt-2"
            defaultSelectedKeys={["famrenda"]}
            selectionMode="multiple"
          >
            <AccordionItem
              key="famrenda"
              aria-label="Família & Renda"
              title="Família & Renda"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <RHFInput
                  numericOnly
                  className="md:col-span-3"
                  inputMode="numeric"
                  label="Nº de pessoas no domicílio"
                  name="socio.n_pessoas_domicilio"
                  placeholder="Ex.: 4"
                />
                <RHFInput
                  className="md:col-span-4"
                  label="Responsável familiar"
                  name="socio.responsavel_familiar"
                  placeholder="Nome do responsável"
                />
                <RHFInput
                  className="md:col-span-3"
                  inputMode="decimal"
                  label="Renda familiar"
                  name="socio.renda_familiar"
                  placeholder="R$ 0,00"
                />
                <div className="md:col-span-2 flex items-end">
                  <RHFSwitch label="Bolsa família" name="socio.bolsa_familia" />
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
                  single
                  chipsClassName="flex flex-wrap gap-2"
                  className="mt-1"
                  label="Escolaridade"
                  name="socio.escolaridade"
                  options={ESCOLARIDADES}
                />
              </div>
              <RHFInput
                autoComplete="organization-title"
                className="md:col-span-4"
                label="Ocupação"
                name="socio.ocupacao"
                placeholder="Ex.: Pedreiro, Professora, Estudante"
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
                single
                chipsClassName="flex flex-wrap gap-2"
                className="mt-1"
                label=""
                name="socio.estado_civil"
                options={ESTADOS_CIVIS}
              />
            </div>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
