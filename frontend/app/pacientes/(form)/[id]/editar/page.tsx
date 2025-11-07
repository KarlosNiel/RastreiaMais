// app/pacientes/(form)/[id]/editar/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditPatientClient from "./EditPatientClient";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = params;
  return {
    title: `Editar Paciente #${id}`,
    description: "Edição do cadastro do paciente",
  };
}

export default function Page({ params }: PageProps) {
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  return <EditPatientClient id={id} />;
}
