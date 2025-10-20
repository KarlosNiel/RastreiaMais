// app/pacientes/(form)/novo/page.tsx
import PatientForm from "@/components/pacientes/PatientForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novo Paciente",
  description:
    "Cadastro de paciente - dados sociodemográficos, condições, clínica, multiprofissional e plano.",
};

export default function Page() {
  // O (form)/layout.tsx já fornece container e largura máxima
  return <PatientForm mode="create" />;
}
