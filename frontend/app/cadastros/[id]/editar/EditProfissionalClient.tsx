"use client";

import { useEffect, useState } from "react";

import ProfessionalForm, {
  ProfissionalFormValues,
} from "@/components/profissional/ProfessionalForm";
import { getProfissional, type ProfessionalApi } from "@/lib/api/profissionais";

type Props = {
  id: number;
};

export default function EditProfissionalClient({ id }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] =
    useState<ProfissionalFormValues | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const profissionalApi = await getProfissional<ProfessionalApi>(id);

        if (!profissionalApi) {
          throw new Error("Profissional não encontrado.");
        }

        const user = profissionalApi.user ?? {};

        const mappedDefaults: ProfissionalFormValues = {
          username: user.username ?? "",
          firstName: user.first_name ?? "",
          lastName: user.last_name ?? "",
          email: user.email ?? "",
          cargo: (profissionalApi.role ??
            "Enfermeiro") as ProfissionalFormValues["cargo"],
          status: profissionalApi.is_deleted ? "inativo" : "ativo",
          senha: "",
          repetirSenha: "",
        };

        if (!cancelled) {
          setDefaultValues(mappedDefaults);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os dados do profissional.";

          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="text-default-500 text-sm">
          Carregando dados do profissional…
        </span>
      </div>
    );
  }

  if (error || !defaultValues) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-danger">
          {error ?? "Não foi possível carregar os dados do profissional."}
        </p>
      </div>
    );
  }

  return <ProfessionalForm defaultValues={defaultValues} id={id} mode="edit" />;
}
