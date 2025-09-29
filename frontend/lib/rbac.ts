// lib/rbac.ts
export type Role = "MANAGER" | "PROFESSIONAL" | "PATIENT";

type Pattern = string; // prefixo da rota; ex: "/dashboard", "/pacientes"

const accessMatrix: Record<Role, Pattern[]> = {
  MANAGER: [
    "/gestor",
    "/config/usuarios-e-permissoes",
    "/profissional",
    "/pacientes",
    "/agendamentos",
    "/alertas",
    "/relatorios",
    "/exportacoes",
  ],
  PROFESSIONAL: [
    "/profissional",
    "/pacientes",
    "/agendamentos",
    "/alertas",
    "/relatorios",
  ],
  PATIENT: ["/me"],
};

// Verifica se um papel pode acessar uma URL (prefix match)
export function canAccess(pathname: string, role?: Role | null): boolean {
  if (!role) return false;
  const allowed = accessMatrix[role];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

// Helper para filtrar itens de menu por papel
export function filterNav<T extends { href: string }>(
  items: T[],
  role?: Role | null
): T[] {
  if (!role) return [];
  return items.filter((it) => canAccess(it.href, role));
}
