// app/cadastros/[id]/editar/EditProfissionalClient.tsx
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import ProfessionalForm, {
  ProfissionalFormValues,
} from "@/components/profissional/ProfessionalForm";

type Props = {
  id: number;
};

type LoadedData = {
  defaultValues: ProfissionalFormValues;
};

export default function EditProfissionalClient({ id }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoadedData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 🔹 Busca o profissional na API
        const profissionalApi = await apiGet<any>(
          `/api/v1/accounts/professionals/${id}/`
        );

        const user = profissionalApi.user ?? {};

        // 🔹 Monta os defaultValues no MESMO formato do ProfessionalForm
        const defaultValues: ProfissionalFormValues = {
          username: user.username ?? "",
          firstName: user.first_name ?? "",
          lastName: user.last_name ?? "",
          email: user.email ?? "",
          telefone: "", // ainda não vem da API
          cargo: profissionalApi.role ?? "Enfermeiro",
          senha: "",
          repetirSenha: "",
        };

        if (!cancelled) {
          setData({ defaultValues });
        }
      } catch (err: any) {
        console.error("Erro ao carregar profissional para edição:", err);
        if (!cancelled) {
          setError(
            err?.message ||
              "Não foi possível carregar os dados do profissional."
          );
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

  if (error || !data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-danger">
          {error ?? "Não foi possível carregar os dados do profissional."}
        </p>
      </div>
    );
  }

  return (
    <ProfessionalForm mode="edit" id={id} defaultValues={data.defaultValues} />
  );
}
