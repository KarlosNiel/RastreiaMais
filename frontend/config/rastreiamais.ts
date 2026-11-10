// frontend/config/rastreiamais.ts
export const app = {
  name: "Rastreia+",
  description: "Monitoramento de DCNT na APS",
  links: {
    supportEmail: "suporterastreiacardio@gmail.com",
  },
};

export type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";

export const navByRole: Record<Role, { label: string; href: string }[]> = {
  MANAGER: [
    { label: "Gestor", href: "/gestor" },
    { label: "Atendimentos", href: "/profissional" },
    { label: "Dashboard Clínico", href: "/profissional/dashboard" },
    { label: "Pacientes", href: "/pacientes" },
    { label: "Configuração", href: "/config/usuarios-e-permissoes" },
  ],
  PROFESSIONAL: [
    { label: "Atendimentos", href: "/profissional" },
    { label: "Dashboard Clínico", href: "/profissional/dashboard" },
    { label: "Pacientes", href: "/pacientes" },
  ],
  PATIENT: [{ label: "Meu Portal", href: "/me" }],
};
