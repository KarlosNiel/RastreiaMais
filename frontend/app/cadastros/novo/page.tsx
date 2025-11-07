"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { RHFInput } from "@/components/form/RHFInput";
import { RHFChipGroup, type ChipOption } from "@/components/form/RHFChipGroup";
import { FormActions } from "@/components/form/FormActions";

/* ===== Tipos / Constantes ===== */
const cargoOptions: ChipOption[] = [
  { label: "Psicólogo", value: "Psicólogo" },
  { label: "Veterinário", value: "Veterinário" },
  { label: "Fisioterapeuta", value: "Fisioterapeuta" },
  { label: "Enfermeiro", value: "Enfermeiro" },
];

type FormInput = {
  nome: string;
  email: string;
  telefone?: string;
  cargo: string;
  senha: string;
  repetirSenha: string;
};

export default function NovoProfissionalPage() {
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = useMemo<FormInput>(
    () => ({
      nome: "",
      email: "",
      telefone: "",
      cargo: "Enfermeiro",
      senha: "",
      repetirSenha: "",
    }),
    []
  );

  const { control, handleSubmit, reset, watch } = useForm<FormInput>({
    defaultValues,
    mode: "onBlur",
  });

  const senhaValue = watch("senha");

  async function onSubmit(values: FormInput) {
    setSubmitting(true);
    try {
      console.log("submit:", values);
      alert("Profissional cadastrado com sucesso!");
      reset(defaultValues);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl text-foreground">
          Novo Profissional
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Preencha os dados abaixo para concluir o cadastro
        </p>
      </div>

      <Card shadow="sm" className="border border-default-200 dark:border-default-100 bg-white dark:bg-gray-900">
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Dados do Profissional
          </h2>

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <RHFInput
              control={control}
              name="nome"
              label="Nome de usuário"
              placeholder="Digite o nome de usuário"
              isRequired
              rules={{
                required: "Informe o nome de usuário",
                minLength: { value: 3, message: "Mínimo de 3 caracteres" },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800"
              }}
            />

            <RHFInput
              control={control}
              name="email"
              type="email"
              label="E-mail vinculado"
              placeholder="Digite o e-mail"
              isRequired
              rules={{
                required: "Informe o e-mail",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "E-mail inválido",
                },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800"
              }}
            />

            <RHFInput
              control={control}
              name="telefone"
              label="Telefone vinculado"
              placeholder="(xx) 9xxxx-xxxx"
              rules={{
                pattern: {
                  value: /^\(?\d{2}\)?9?\d{4}-?\d{3,4}$/,
                  message: "Telefone inválido",
                },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800"
              }}
            />

            <RHFChipGroup
              control={control}
              name="cargo"
              label="Cargo"
              options={cargoOptions}
              rules={{ required: "Selecione o cargo" }}
              single
              className="md:col-span-2"
            />

            <RHFInput
              control={control}
              name="senha"
              type="password"
              label="Senha"
              placeholder="Digite a senha"
              isRequired
              rules={{
                required: "Informe a senha",
                minLength: { value: 6, message: "Mínimo de 6 caracteres" },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800"
              }}
            />

            <RHFInput
              control={control}
              name="repetirSenha"
              type="password"
              label="Repetir a senha"
              placeholder="Repita a senha"
              isRequired
              rules={{
                required: "Repita a senha",
                minLength: { value: 6, message: "Mínimo de 6 caracteres" },
                validate: (v) => v === senhaValue || "As senhas não conferem",
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800"
              }}
            />

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <Button
                variant="flat"
                color="danger"
                as="a"
                href="/gestor"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={submitting}
              >
                Finalizar Registro
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
