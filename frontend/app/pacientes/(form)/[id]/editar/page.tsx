// app/pacientes/(form)/[id]/editar/page.tsx
import PatientForm from "@/components/pacientes/PatientForm";
import {
  dmApiToForm,
  hasApiToForm,
  patientApiToForm,
} from "@/lib/pacientes/mappers";
import type { Metadata } from "next";
import { cookies } from "next/headers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Editar Paciente #${id}`,
    description: "Edição do cadastro do paciente",
  };
}

function getApiBase() {
  const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
  return RAW_BASE.replace(/\/$/, "");
}

async function fetchWithAuth(path: string) {
  // cookies() é assíncrono no seu ambiente
  const cookieStore = await cookies();
  const token =
    cookieStore.get("access")?.value ?? cookieStore.get("token")?.value;

  const res = await fetch(`${getApiBase()}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Falha ao carregar recurso ${path}: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

async function fetchPaciente(id: number) {
  return fetchWithAuth(`/api/v1/accounts/patients/${id}/`);
}

async function fetchConditionsForPatient(id: number) {
  // tenta buscar HAS e DM filtrando por patient
  const [hasRaw, dmRaw] = await Promise.all([
    fetchWithAuth(
      `/api/v1/conditions/systolic-hypertension-cases/?patient=${id}`
    ),
    fetchWithAuth(`/api/v1/conditions/diabetes-mellitus-cases/?patient=${id}`),
  ]);

  const normalize = (data: any) =>
    Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];

  const hasList = normalize(hasRaw);
  const dmList = normalize(dmRaw);

  const has =
    hasList.find((item: any) => Number(item.patient) === Number(id)) ?? null;
  const dm =
    dmList.find((item: any) => Number(item.patient) === Number(id)) ?? null;

  return { has, dm };
}

export default async function Page({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    throw new Error("ID inválido");
  }

  // carrega paciente + condições em paralelo
  const [pacienteApi, conditions] = await Promise.all([
    fetchPaciente(id),
    fetchConditionsForPatient(id),
  ]);

  // converte payload flat da API para o shape esperado pelo form (Zod)
  const defaultValues = patientApiToForm(pacienteApi);

  let hasId: number | null = null;
  let dmId: number | null = null;

  if (conditions.has) {
    hasId = conditions.has.id;
    defaultValues.condicoes.has = true;
    defaultValues.clinica.has = hasApiToForm(conditions.has) as any;
  }

  if (conditions.dm) {
    dmId = conditions.dm.id;
    defaultValues.condicoes.dm = true;
    defaultValues.clinica.dm = dmApiToForm(conditions.dm) as any;
  }

  // O layout do (form) já cuida de container, largura e paddings
  return (
    <PatientForm
      mode="edit"
      id={id}
      defaultValues={defaultValues}
      hasId={hasId}
      dmId={dmId}
    />
  );
}
