// frontend/lib/auth.ts
import { apiJSON, clearTokens, setTokens } from "./api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";

export interface MeResponse {
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  roles: Role[];
}

// ─────────────────────────────────────────────────────────────
// Helpers de ambiente / cookies
// ─────────────────────────────────────────────────────────────
function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function setRoleCookie(role: Role) {
  if (!isBrowser()) return;
  // Marcar Secure APENAS quando a página está em HTTPS
  const isHttps =
    typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = [
    `role=${encodeURIComponent(role)}`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=86400", // 24 horas - expira automaticamente
    isHttps ? "Secure" : "", // <- apenas em HTTPS
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearRoleCookie() {
  if (!isBrowser()) return;
  document.cookie = "role=; Path=/; Max-Age=0; SameSite=Lax";
}

// ─────────────────────────────────────────────────────────────
// Fluxo principal de autenticação
// ─────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string,
  persistent: boolean = true
): Promise<MeResponse> {
  const res = await fetch(`${API}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let msg = "Credenciais inválidas.";
    try {
      const data = await res.json();
      msg = (data?.detail as string) || msg;
    } catch {
      const txt = await res.text();
      if (txt) msg = txt;
    }
    throw new Error(msg);
  }

  const { access, refresh } = await res.json();
  setTokens(access, refresh, persistent);
  return meFetch();
}

export async function loginAndAssertRole(
  username: string,
  password: string,
  required: Role[],
  persistent: boolean = true
): Promise<MeResponse> {
  const me = await login(username, password, persistent);
  if (!hasAnyRole(me.roles, required)) {
    logout();
    throw new Error(
      required.length === 1
        ? `Esta conta não possui o papel necessário (${required[0]}).`
        : `Esta conta não possui os papéis necessários (${required.join(", ")}).`
    );
  }
  
  // Disparar evento para atualizar o contexto
  if (isBrowser()) {
    window.dispatchEvent(new Event('tokenRefresh'));
  }
  
  return me;
}

export async function meFetch(): Promise<MeResponse> {
  try {
    const me = await apiJSON(`/api/auth/me`, { method: "GET" });
    return me as MeResponse;
  } catch (err: any) {
    const msg = err?.message || "Sua sessão expirou. Faça login novamente.";
    throw new Error(msg);
  }
}

function getRefreshToken(): string | null {
  try {
    if (!isBrowser()) return null;
    return localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    // Tenta fazer logout no servidor (blacklist do token)
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
  } catch (error) {
    // Se falhar no servidor, continua com logout local
    console.warn("Erro ao fazer logout no servidor:", error);
  } finally {
    // Sempre limpa os dados locais
    clearTokens();
    clearRoleCookie();
    if (isBrowser()) {
      localStorage.removeItem("role");
      // Disparar evento para atualizar o contexto
      window.dispatchEvent(new Event('tokenRefresh'));
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Utilitários de papéis e roteamento
// ─────────────────────────────────────────────────────────────

export function hasAnyRole(userRoles: Role[], required: Role[]): boolean {
  return userRoles.some((r) => required.includes(r));
}

/** Escolhe dashboard por prioridade: MANAGER > PROFESSIONAL > PATIENT */
export function pickDashboard(roles: Role[]): string {
  if (roles.includes("MANAGER")) return "/gestor";
  if (roles.includes("PROFESSIONAL")) return "/profissional";
  if (roles.includes("PATIENT")) return "/me";
  return "/auth/login";
}

/** (Opcional) Devolve um papel "dominante" para setar no cookie */
export function pickRole(roles: Role[]): Role | null {
  if (roles.includes("MANAGER")) return "MANAGER";
  if (roles.includes("PROFESSIONAL")) return "PROFESSIONAL";
  if (roles.includes("PATIENT")) return "PATIENT";
  return null;
}
