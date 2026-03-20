// app/pacientes/(form)/novo/page.tsx
import type { Metadata } from "next";

import PatientForm from "@/components/pacientes/PatientForm";

export const metadata: Metadata = {
  title: "Novo Paciente",
  description:
    "Cadastro de paciente - dados sociodemográficos, condições, clínica, multiprofissional e plano.",
};

export default function Page() {
  // O (form)/layout.tsx já fornece container e largura máxima
  return <PatientForm mode="create" />;
}
