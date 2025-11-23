"use client";

import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PacientesTable, type PatientRow } from "@/components/pacientes/PacientesTable";

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
    <main className="min-h-screen bg-content1 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">
            Carregando pacientes...
          </div>
        ) : isError ? (
          <div className="text-red-600 dark:text-red-400">
            Erro ao carregar pacientes.
          </div>
        ) : (
          <PacientesTable
            rows={patients}
            onAction={(action, row) => {
              if (action === "edit") {
                router.push(`/pacientes/${row.id}/editar`);
              }
              if (action === "open") {
                router.push(`/pacientes/${row.id}/editar`);
              }
            }}
          />
        )}
      </div>
    </main>
  );
}