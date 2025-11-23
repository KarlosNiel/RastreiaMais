import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditProfissionalClient from "./EditProfissionalClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params; 
  return {
    title: `Editar Profissional #${id}`,
    description: "Edição do cadastro do profissional de saúde",
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; 
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  return <EditProfissionalClient id={numericId} />;
}