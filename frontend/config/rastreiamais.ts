// frontend/config/rastreiamais.ts
export const app = {
  name: "Rastreia+",
  description: "Monitoramento de DCNT na APS",
  links: {
    supportEmail: "suporterastreia+@gmail.com",
  },
};

export type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";

export const navByRole: Record<Role, { label: string; href: string }[]> = {
  MANAGER: [
    { label: "Gestor", href: "/gestor" },
    { label: "Profissional", href: "/profissional" },
    { label: "Pacientes", href: "/pacientes" },
    { label: "Configuração", href: "/config/usuarios-e-permissoes" },
  ],
  PROFESSIONAL: [
    { label: "Dashboard", href: "/profissional" },
    { label: "Pacientes", href: "/pacientes" },
  ],
  PATIENT: [{ label: "Meu Portal", href: "/me" }],
};
