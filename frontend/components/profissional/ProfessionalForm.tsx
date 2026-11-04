"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Alert } from "@heroui/alert";

import {
  createProfissional,
  updateProfissional,
  deleteProfissional,
  restoreProfissional,
  type ProfessionalRole,
  type ProfessionalUserApiUser,
  type ProfessionalApiPayload,
} from "@/lib/api/profissionais";
import { RHFInput } from "@/components/form/RHFInput";
import { RHFChipGroup, type ChipOption } from "@/components/form/RHFChipGroup";

/* ===== Tipos / Constantes ===== */

const cargoOptions: ChipOption[] = [
  { label: "Odontologista", value: "Odontologista" },
  { label: "Enfermeiro", value: "Enfermeiro" },
  { label: "ACS", value: "ACS" },
];

const statusOptions: ChipOption[] = [
  { label: "Ativo", value: "ativo" },
  { label: "Inativo", value: "inativo" },
];

export type ProfissionalFormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  cargo: ProfessionalRole;
  status?: "ativo" | "inativo";
  senha: string;
  repetirSenha: string;
};

type ProfessionalFormProps = {
  mode: "create" | "edit";
  id?: number;
  /** Valores vindos da API (Edit), já mapeados para o formato do form */
  defaultValues?: Partial<ProfissionalFormValues>;
};

export default function ProfessionalForm({
  mode,
  id,
  defaultValues,
}: ProfessionalFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  const isCreate = mode === "create";

  const baseDefaults: ProfissionalFormValues = {
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    cargo: "Enfermeiro",
    status: "ativo",
    senha: "",
    repetirSenha: "",
  };

  const mergedDefaults = useMemo(
    () => ({ ...baseDefaults, ...(defaultValues ?? {}) }),
    [defaultValues],
  );

  const { control, handleSubmit, watch } = useForm<ProfissionalFormValues>({
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });

  const senhaValue = watch("senha");

  async function onSubmit(values: ProfissionalFormValues) {
    setSubmitting(true);
    setAlert(null);

    try {
      const username = values.username.trim();
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      const email = values.email.trim();

      // Base para o objeto user da API
      const payloadUser: Partial<ProfessionalUserApiUser> = {
        first_name: firstName,
        last_name: lastName,
        email,
      };

      if (isCreate) {
        payloadUser.username = username;
        payloadUser.password = values.senha;
      } else {
        const originalUsername = defaultValues?.username?.trim();

        if (!originalUsername || originalUsername !== username) {
          payloadUser.username = username;
        }

        if (values.senha) {
          payloadUser.password = values.senha;
        }
      }

      const payload: ProfessionalApiPayload = {
        user: payloadUser as ProfessionalUserApiUser,
        role: values.cargo,
      };

      if (isCreate) {
        await createProfissional(payload);

        setAlert({
          type: "success",
          message: "Profissional cadastrado com sucesso!",
        });
      } else {
        if (!id) {
          throw new Error("ID do profissional não informado.");
        }

        // 1) Atualiza dados básicos (nome, e-mail, cargo, senha)
        await updateProfissional(id, payload);

        // 2) Se o status tiver mudado, aplica soft delete / restore
        const previousStatus = defaultValues?.status ?? "ativo";
        const currentStatus = values.status ?? previousStatus;

        if (currentStatus !== previousStatus) {
          if (currentStatus === "inativo") {
            await deleteProfissional(id);
          } else {
            await restoreProfissional(id);
          }
        }

        setAlert({
          type: "success",
          message: "Profissional atualizado com sucesso!",
        });
      }

      setTimeout(() => {
        window.location.href = "/gestor";
      }, 1500);
    } catch (e: any) {
      setAlert({
        type: "danger",
        message:
          e?.message ??
          "Erro ao salvar profissional. Tente novamente mais tarde.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert className="mb-6" color={alert.type} radius="lg" variant="flat">
          {alert.message}
        </Alert>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl text-foreground">
          {isCreate ? "Novo Profissional" : "Editar Profissional"}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {isCreate
            ? "Preencha os dados abaixo para concluir o cadastro."
            : "Atualize os dados do profissional e, se necessário, altere o status."}
        </p>
      </div>

      <Card
        className="border border-slate-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-xl shadow-2xs"
        shadow="none"
      >
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Dados do Profissional
          </h2>

          <form
            noValidate
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <RHFInput
              isRequired
              control={control}
              label="Nome de usuário"
              name="username"
              placeholder="Ex: joao.silva"
              radius="md"
              rules={{
                required: "Informe o nome de usuário",
                minLength: { value: 3, message: "Mínimo de 3 caracteres" },
                pattern: {
                  value: /^[\w.@+-]+$/,
                  message: "Use apenas letras, números e os símbolos @ . + - _",
                },
              }}
            />

            <RHFInput
              isRequired
              control={control}
              label="Primeiro nome"
              name="firstName"
              placeholder="Ex: João"
              radius="md"
              rules={{ required: "Informe o primeiro nome" }}
            />

            <RHFInput
              isRequired
              control={control}
              label="Sobrenome"
              name="lastName"
              placeholder="Ex: da Silva"
              radius="md"
              rules={{ required: "Informe o sobrenome" }}
            />

            <RHFInput
              isRequired
              control={control}
              label="E-mail vinculado"
              name="email"
              placeholder="Digite o e-mail"
              radius="md"
              rules={{
                required: "Informe o e-mail",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "E-mail inválido",
                },
              }}
              type="email"
            />

            {isCreate ? (
              <RHFChipGroup
                single
                className="md:col-span-2"
                control={control}
                label="Cargo"
                name="cargo"
                options={cargoOptions}
                rules={{ required: "Selecione o cargo" }}
              />
            ) : (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <RHFChipGroup
                  single
                  control={control}
                  label="Cargo"
                  name="cargo"
                  options={cargoOptions}
                  rules={{ required: "Selecione o cargo" }}
                />
                <RHFChipGroup
                  single
                  control={control}
                  label="Status"
                  name="status"
                  options={statusOptions}
                />
              </div>
            )}

            <RHFInput
              control={control}
              isRequired={isCreate}
              label={isCreate ? "Senha" : "Nova senha"}
              name="senha"
              placeholder={
                isCreate
                  ? "Digite a senha"
                  : "Deixe em branco para manter a atual"
              }
              radius="md"
              rules={{
                required: isCreate ? "Informe a senha" : false,
                minLength: {
                  value: 6,
                  message: "Mínimo de 6 caracteres",
                },
              }}
              type="password"
            />

            <RHFInput
              control={control}
              isRequired={isCreate}
              label={isCreate ? "Repetir a senha" : "Confirmar nova senha"}
              name="repetirSenha"
              placeholder={
                isCreate
                  ? "Repita a senha"
                  : "Repita a nova senha (se informada)"
              }
              radius="md"
              rules={{
                required: isCreate ? "Repita a senha" : false,
                validate: (v) => {
                  if (!senhaValue && !isCreate) return true;

                  return v === senhaValue || "As senhas não conferem";
                },
              }}
              type="password"
            />

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <Button
                as="a"
                className="font-medium text-slate-700 dark:text-zinc-300"
                href="/gestor"
                radius="md"
                variant="flat"
              >
                Cancelar
              </Button>
              <Button
                className="font-medium"
                color="primary"
                isLoading={submitting}
                radius="md"
                type="submit"
              >
                {isCreate ? "Finalizar registro" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
