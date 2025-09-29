// lib/routes.ts
export const routes = {
  // público
  login: "/auth/login",

  // gestor
  dashboard: "/gestor",
  usersAndRoles: "/config/usuarios-e-permissoes",

  // profissional
  professional: "/profissional",
  patients: "/pacientes",
  patientNew: "/pacientes/novo",
  patientEdit: (id: string | number) => `/pacientes/${id}/editar`,

  // comuns
  appointments: "/agendamentos",
  alerts: "/alertas",
  reports: "/relatorios",
  exports: "/exportacoes",

  // opcional (portal do paciente – só leitura)
  me: "/me",
} as const;
