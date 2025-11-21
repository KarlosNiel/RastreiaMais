// app/pacientes/(form)/[id]/editar/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditPatientClient from "./EditPatientClient";

// Agora params é uma Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { id } = await props.params;
  return {
    title: `Editar Paciente #${id}`,
    description: "Edição do cadastro do paciente",
  };
}

export default async function Page(props: PageProps) {
  const { id } = await props.params;

  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  return <EditPatientClient id={numericId} />;
}
