"use client";

import { RHFChipGroup, type ChipOption } from "@/components/form/RHFChipGroup";
import { RHFInput } from "@/components/form/RHFInput";
import {
  createProfissional,
  updateProfissional,
} from "@/lib/api/profissionais";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

/* ===== Tipos / Constantes ===== */
const cargoOptions: ChipOption[] = [
  { label: "Odontologista", value: "Odontologista" },
  { label: "Enfermeiro", value: "Enfermeiro" },
  { label: "ACS", value: "ACS" },
];

export type ProfissionalFormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  telefone?: string;
  cargo: string;
  senha: string;
  repetirSenha: string;
};

type ProfessionalFormProps = {
  mode: "create" | "edit";
  id?: number;
  defaultValues?: Partial<ProfissionalFormValues>;
};

export default function ProfessionalForm({
  mode,
  id,
  defaultValues,
}: ProfessionalFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const baseDefaults: ProfissionalFormValues = {
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    telefone: "",
    cargo: "Enfermeiro",
    senha: "",
    repetirSenha: "",
  };

  // merge dos defaults base + defaults vindos do EditProfissionalClient
  const mergedDefaults = useMemo(
    () => ({ ...baseDefaults, ...(defaultValues ?? {}) }),
    [defaultValues]
  );

  const { control, handleSubmit, watch } = useForm<ProfissionalFormValues>({
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });

  const senhaValue = watch("senha");
  const isCreate = mode === "create";

  async function onSubmit(values: ProfissionalFormValues) {
    setSubmitting(true);
    try {
      const username = values.username.trim();
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      const email = values.email.trim();

      const payloadUser: any = {
        first_name: firstName,
        last_name: lastName,
        email,
      };

      if (isCreate) {
        // criação: SEMPRE precisa enviar username + password
        payloadUser.username = username;
        payloadUser.password = values.senha;
      } else {
        // edição: só manda username se mudou em relação ao valor original
        const originalUsername = defaultValues?.username?.trim();
        if (!originalUsername || originalUsername !== username) {
          payloadUser.username = username;
        }

        // na edição, só manda password se o usuário informou
        if (values.senha) {
          payloadUser.password = values.senha;
        }
      }

      const payload = {
        user: payloadUser,
        role: values.cargo as "Odontologista" | "Enfermeiro" | "ACS",
      };

      if (isCreate) {
        await createProfissional(payload);
        alert("Profissional cadastrado com sucesso!");
      } else {
        if (!id) {
          throw new Error("ID do profissional não informado para edição.");
        }
        await updateProfissional(id, payload);
        alert("Profissional atualizado com sucesso!");
      }

      router.push("/gestor");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Erro ao salvar profissional");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl text-foreground">
          {isCreate ? "Novo Profissional" : "Editar Profissional"}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {isCreate
            ? "Preencha os dados abaixo para concluir o cadastro"
            : "Atualize os dados do profissional"}
        </p>
      </div>

      <Card
        shadow="sm"
        className="border border-default-200 dark:border-default-100 bg-white dark:bg-gray-900"
      >
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Dados do Profissional
          </h2>

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Username */}
            <RHFInput
              control={control}
              name="username"
              label="Nome de usuário"
              placeholder="Ex: joao.silva"
              isRequired
              rules={{
                required: "Informe o nome de usuário",
                minLength: { value: 3, message: "Mínimo de 3 caracteres" },
                pattern: {
                  value: /^[\w.@+-]+$/,
                  message:
                    "Use apenas letras, números e os símbolos @ . + - _ (sem espaços)",
                },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
              }}
            />

            {/* First name */}
            <RHFInput
              control={control}
              name="firstName"
              label="Primeiro nome"
              placeholder="Ex: João"
              isRequired
              rules={{
                required: "Informe o primeiro nome",
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
              }}
            />

            {/* Last name */}
            <RHFInput
              control={control}
              name="lastName"
              label="Sobrenome"
              placeholder="Ex: da Silva"
              isRequired
              rules={{
                required: "Informe o sobrenome",
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
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
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
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
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
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

            {/* Senha */}
            <RHFInput
              control={control}
              name="senha"
              type="password"
              label={isCreate ? "Senha" : "Nova senha"}
              placeholder={
                isCreate
                  ? "Digite a senha"
                  : "Deixe em branco para manter a senha atual"
              }
              isRequired={isCreate}
              rules={{
                required: isCreate ? "Informe a senha" : false,
                minLength: {
                  value: 6,
                  message: "Mínimo de 6 caracteres",
                },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
              }}
            />

            <RHFInput
              control={control}
              name="repetirSenha"
              type="password"
              label={isCreate ? "Repetir a senha" : "Confirmar nova senha"}
              placeholder={
                isCreate
                  ? "Repita a senha"
                  : "Repita a nova senha (se informada)"
              }
              isRequired={isCreate}
              rules={{
                required: isCreate ? "Repita a senha" : false,
                minLength: isCreate
                  ? { value: 6, message: "Mínimo de 6 caracteres" }
                  : undefined,
                validate: (v) => {
                  if (!senhaValue && !isCreate) return true;
                  return v === senhaValue || "As senhas não conferem";
                },
              }}
              classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800",
              }}
            />

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <Button variant="flat" color="danger" as="a" href="/gestor">
                Cancelar
              </Button>
              <Button type="submit" color="primary" isLoading={submitting}>
                {isCreate ? "Finalizar Registro" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
