// app/pacientes/(form)/[id]/editar/page.tsx
import PatientForm from "@/components/pacientes/PatientForm";
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
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
}

async function fetchPaciente(id: number) {
  // cookies() é assíncrono no seu ambiente
  const cookieStore = await cookies();
  const token =
    cookieStore.get("access")?.value ?? cookieStore.get("token")?.value;

  const res = await fetch(`${getApiBase()}/api/v1/accounts/patients/${id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store", // não cachear dados de edição
  });

  if (!res.ok) {
    throw new Error(
      `Falha ao carregar paciente #${id}: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export default async function Page({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    throw new Error("ID inválido");
  }

  const paciente = await fetchPaciente(id);

  // Se precisar, adapte o payload do backend para o shape do form:
  // const defaultValues = adaptPacienteToForm(paciente);
  const defaultValues = paciente;

  // O layout do (form) já cuida de container, largura e paddings
  return <PatientForm mode="edit" id={id} defaultValues={defaultValues} />;
}
