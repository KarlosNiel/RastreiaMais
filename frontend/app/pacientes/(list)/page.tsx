"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { apiGet } from "@/lib/api";
import {
  PacientesTable,
  type PatientRow,
} from "@/components/pacientes/PacientesTable";

export default function Page() {
  const router = useRouter();

  const {
    data: patients = [],
    isLoading,
    isError,
  } = useQuery<PatientRow[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/accounts/patients/");

      const list = Array.isArray(resp)
        ? resp
        : resp && Array.isArray((resp as any).results)
          ? (resp as any).results
          : [];

      return list.map((p: any): PatientRow => {
        const addrFromAddress =
          p.address && typeof p.address === "object" ? p.address : null;

        const addrFromObj =
          p.address_obj && typeof p.address_obj === "object"
            ? p.address_obj
            : null;

        const addr = addrFromAddress || addrFromObj;

        return {
          id: String(p.id),
          user: p.user ?? { first_name: "", last_name: "" },
          cpf: p.cpf ?? "",
          address: addr,
        };
      });
    },
  });

  return (
    <main className="min-h-screen bg-background dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-1 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Pacientes
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Listagem geral e prontuários cadastrados na unidade de saúde
          </p>
        </header>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
            Carregando pacientes...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">
            Erro ao carregar pacientes.
          </div>
        ) : (
          <PacientesTable
            rows={patients}
            onAction={(action, row) => {
              if (action === "edit" || action === "open") {
                router.push(`/pacientes/${row.id}/editar`);
              }
            }}
          />
        )}
      </div>
    </main>
  );
}
