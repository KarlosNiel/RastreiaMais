// frontend/app/cadastros/[id]/editar/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditProfissionalClient from "./EditProfissionalClient";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = params;
  return {
    title: `Editar Profissional #${id}`,
    description: "Edição do cadastro do profissional de saúde",
  };
}

export default function Page({ params }: PageProps) {
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  return <EditProfissionalClient id={id} />;
}
