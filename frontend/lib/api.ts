// frontend/lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────────────────────────
// Token storage (client-only)
// ─────────────────────────────────────────────────────────────
function isBrowser() {
  return typeof window !== "undefined";
}

function getAccess(): string | null {
  try {
    return isBrowser() ? sessionStorage.getItem("access") : null;
  } catch {
    return null;
  }
}

function getRefresh(): string | null {
  try {
    return isBrowser() ? sessionStorage.getItem("refresh") : null;
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string) {
  try {
    if (!isBrowser()) return;
    sessionStorage.setItem("access", access);
    sessionStorage.setItem("refresh", refresh);
  } catch {}
}

export function clearTokens() {
  try {
    if (!isBrowser()) return;
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// Headers util — não sobrescreve multipart
// ─────────────────────────────────────────────────────────────
function isFormDataBody(init: RequestInit) {
  return typeof FormData !== "undefined" && init.body instanceof FormData;
}

function buildHeaders(init: RequestInit): Record<string, string> {
  const base: Record<string, string> = {};
  if (!isFormDataBody(init)) {
    base["Content-Type"] = "application/json";
  }

  const incoming = (init.headers as Record<string, string>) || {};
  Object.assign(base, incoming);

  const acc = getAccess();
  if (acc) base.Authorization = `Bearer ${acc}`;

  return base;
}

// ─────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(res: Response) {
  try {
    const maybeJson = await res.clone().json();
    if (maybeJson?.detail) return String(maybeJson.detail);
    if (maybeJson?.message) return String(maybeJson.message);
    return JSON.stringify(maybeJson);
  } catch {
    try {
      const text = await res.text();
      return text || `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}`;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Refresh mutex — evita múltiplos refresh concorrentes
// ─────────────────────────────────────────────────────────────
let refreshInFlight: Promise<string | null> | null = null;

async function ensureAccessToken(): Promise<string | null> {
  // Se já temos um access válido, usa ele
  const current = getAccess();
  if (current) return current;

  // Senão tenta refresh (com mutex)
  if (!refreshInFlight) {
    const ref = getRefresh();
    refreshInFlight = (async () => {
      if (!ref) return null;
      const r = await fetch(`${API}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: ref }),
      });
      if (!r.ok) return null;
      const { access } = await r.json();
      if (access) setTokens(access, ref);
      return access ?? null;
    })().finally(() => {
      // libera o mutex após concluir
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// ─────────────────────────────────────────────────────────────
// Low-level fetch com retry de refresh (1x)
// ─────────────────────────────────────────────────────────────
async function raw(path: string, init: RequestInit = {}) {
  const headers = buildHeaders(init);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  return res;
}

/**
 * Executa a request e, se der 401 (não sendo rota de token), tenta um refresh 1x.
 */
async function rawWithRetry(path: string, init: RequestInit = {}) {
  let res = await raw(path, init);

  const isAuthPath =
    path.startsWith("/api/token/") || path.startsWith("/api/auth/login");

  if (res.status === 401 && !isAuthPath) {
    // tenta renovar
    const newAccess = await ensureAccessToken();
    if (newAccess) {
      // refaz a chamada com o novo access no header
      const retryHeaders = buildHeaders(init);
      retryHeaders.Authorization = `Bearer ${newAccess}`;
      res = await fetch(`${API}${path}`, { ...init, headers: retryHeaders });
    }
  }

  return res;
}

// ─────────────────────────────────────────────────────────────
// JSON helpers
// ─────────────────────────────────────────────────────────────
export async function apiJSON<T = any>(path: string, init: RequestInit = {}) {
  const res = await rawWithRetry(path, init);

  if (!res.ok) {
    const msg = await readErrorMessage(res);
    throw new ApiError(msg, res.status);
  }

  if (res.status === 204 || res.status === 205) return null as T;
  return (await res.json()) as T;
}

export async function apiRaw(path: string, init: RequestInit = {}) {
  const res = await rawWithRetry(path, init);
  if (!res.ok) {
    const msg = await readErrorMessage(res);
    throw new ApiError(msg, res.status);
  }
  return res;
}

// ─────────────────────────────────────────────────────────────
// Verb helpers (convenience)
// ─────────────────────────────────────────────────────────────
export function apiGet<T = any>(path: string, init: RequestInit = {}) {
  return apiJSON<T>(path, { ...init, method: "GET" });
}

export function apiPost<T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) {
  const isFD = body instanceof FormData;
  return apiJSON<T>(path, {
    ...init,
    method: "POST",
    body: isFD ? body : JSON.stringify(body ?? {}),
  });
}

export function apiPut<T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) {
  const isFD = body instanceof FormData;
  return apiJSON<T>(path, {
    ...init,
    method: "PUT",
    body: isFD ? body : JSON.stringify(body ?? {}),
  });
}

export function apiPatch<T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) {
  const isFD = body instanceof FormData;
  return apiJSON<T>(path, {
    ...init,
    method: "PATCH",
    body: isFD ? body : JSON.stringify(body ?? {}),
  });
}

export function apiDelete<T = any>(path: string, init: RequestInit = {}) {
  return apiJSON<T>(path, { ...init, method: "DELETE" });
}
