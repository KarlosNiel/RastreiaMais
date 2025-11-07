// app/pacientes/(form)/[id]/editar/EditPatientClient.tsx
"use client";

import PatientForm from "@/components/pacientes/PatientForm";
import { apiGet } from "@/lib/api";
import {
  dmApiToForm,
  hasApiToForm,
  patientApiToForm,
} from "@/lib/pacientes/mappers";
import { useEffect, useState } from "react";

type Props = {
  id: number;
};

type LoadedData = {
  defaultValues: any;
  hasId: number | null;
  dmId: number | null;
};

export default function EditPatientClient({ id }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoadedData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const pacienteApi = await apiGet<any>(
          `/api/v1/accounts/patients/${id}/`
        );

        const [hasRaw, dmRaw] = await Promise.all([
          apiGet<any>(
            `/api/v1/conditions/systolic-hypertension-cases/?patient=${id}`
          ),
          apiGet<any>(
            `/api/v1/conditions/diabetes-mellitus-cases/?patient=${id}`
          ),
        ]);

        const defaultValues = patientApiToForm(pacienteApi);

        const normalize = (d: any) =>
          Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

        const hasList = normalize(hasRaw);
        const dmList = normalize(dmRaw);

        const has =
          hasList.find((item: any) => Number(item.patient) === Number(id)) ??
          null;
        const dm =
          dmList.find((item: any) => Number(item.patient) === Number(id)) ??
          null;

        let hasId: number | null = null;
        let dmId: number | null = null;

        if (has) {
          hasId = has.id;
          defaultValues.condicoes.has = true;
          defaultValues.clinica.has = hasApiToForm(has) as any;
        }

        if (dm) {
          dmId = dm.id;
          defaultValues.condicoes.dm = true;
          defaultValues.clinica.dm = dmApiToForm(dm) as any;
        }

        if (!cancelled) {
          setData({ defaultValues, hasId, dmId });
        }
      } catch (err: any) {
        console.error("Erro ao carregar paciente para edição:", err);
        if (!cancelled) {
          setError(
            err?.message || "Não foi possível carregar os dados do paciente."
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
          Carregando dados do paciente…
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-danger">
          {error ?? "Não foi possível carregar os dados do paciente."}
        </p>
      </div>
    );
  }

  return (
    <PatientForm
      mode="edit"
      id={id}
      defaultValues={data.defaultValues}
      hasId={data.hasId}
      dmId={data.dmId}
    />
  );
}
