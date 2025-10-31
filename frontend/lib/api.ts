import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

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
// Error helpers
// ─────────────────────────────────────────────────────────────
class ApiError extends Error {
  status: number;
  response?: any;
  constructor(message: string, status: number, response?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

function readErrorMessageFromAxios(errResp: any) {
  try {
    const data = errResp?.data;
    if (!data) return `HTTP ${errResp?.status ?? "Error"}`;
    if (data.detail) return String(data.detail);
    if (data.message) return String(data.message);
    return JSON.stringify(data);
  } catch {
    return `HTTP ${errResp?.status ?? "Error"}`;
  }
}

// ─────────────────────────────────────────────────────────────
// Axios instance + refresh mutex
// ─────────────────────────────────────────────────────────────
let refreshInFlight: Promise<string | null> | null = null;

async function ensureAccessToken(): Promise<string | null> {
  const current = getAccess();
  if (current) return current;

  if (!refreshInFlight) {
    const ref = getRefresh();
    refreshInFlight = (async () => {
      if (!ref) return null;
      try {
        const r = await axios.post(`${API}/api/token/refresh/`, { refresh: ref }, { headers: { "Content-Type": "application/json" } });
        const access = r.data?.access;
        if (access) setTokens(access, ref);
        return access ?? null;
      } catch {
        // refresh failed -> clear tokens
        clearTokens();
        return null;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

function isAuthPath(path: string) {
  return path.startsWith("/api/token/") || path.startsWith("/api/auth/login");
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API,
  withCredentials: false,
});

// request interceptor to attach access token
axiosInstance.interceptors.request.use((config) => {
  const acc = getAccess();
  // debug mínimo
  // console.debug("[API] request:", config.method, config.url, "has token:", !!acc);
  if (acc) {
    config.headers = config.headers ?? {};
    // do not override existing Authorization if already provided
    if (!((config.headers as any)["Authorization"]) && !((config.headers as any)["authorization"])) {
      (config.headers as any)["Authorization"] = `Bearer ${acc}`;
    }
  }
  // if body is FormData, let the browser set Content-Type
  const isFormData = typeof FormData !== "undefined" && (config as any).data instanceof FormData;
  if (isFormData && config.headers) {
    delete (config.headers as any)["Content-Type"];
  }
  return config;
});

// response interceptor to handle 401 -> try refresh once and retry original request
axiosInstance.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    // proteções: error.config pode ser undefined em alguns cenários
    if (!error || !error.config) {
      return Promise.reject(error);
    }

    const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // if no response or not 401, just reject
    if (!error.response || status !== 401) {
      return Promise.reject(error);
    }

    const requestPath = (originalConfig.url ?? "") as string;
    // do not attempt refresh for auth endpoints
    if (isAuthPath(requestPath) || originalConfig._retry) {
      return Promise.reject(error);
    }

    // attempt refresh
    const newAccess = await ensureAccessToken();
    if (!newAccess) {
      return Promise.reject(error);
    }

    // mark retry to avoid loops
    originalConfig._retry = true;
    originalConfig.headers = originalConfig.headers ?? {};
    (originalConfig.headers as any)["Authorization"] = `Bearer ${newAccess}`;

    try {
      const retryResp = await axiosInstance.request(originalConfig);
      return retryResp;
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// Low-level helpers
// ─────────────────────────────────────────────────────────────
async function rawWithAxios(path: string, init: RequestInit = {}) {
  // map RequestInit to axios config
  const method = ((init.method ?? "GET") as string).toUpperCase();
  const headers = { ...((init.headers as Record<string, string>) || {}) };
  let data: any = undefined;

  if ((init as any).body !== undefined) data = (init as any).body;

  try {
    const resp = await axiosInstance.request({
      url: path,
      method: method as any,
      headers,
      data,
      // allow passing other axios options via init if needed
    });
    return resp;
  } catch (err) {
    throw err as AxiosError;
  }
}

// ─────────────────────────────────────────────────────────────
// JSON helpers (public API consistent with previous implementation)
// ─────────────────────────────────────────────────────────────
export async function apiJSON<T = any>(path: string, init: RequestInit = {}) {
  try {
    const res = await rawWithAxios(path, init);
    // successful; return data (handle 204/205)
    if (res.status === 204 || res.status === 205) return null as T;
    return res.data as T;
  } catch (err) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status ?? 0;
    const msg = readErrorMessageFromAxios(axiosErr.response);
    throw new ApiError(msg, status, axiosErr.response?.data);
  }
}

export async function apiRaw(path: string, init: RequestInit = {}) {
  try {
    const res = await rawWithAxios(path, init);
    return res;
  } catch (err) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status ?? 0;
    const msg = readErrorMessageFromAxios(axiosErr.response);
    throw new ApiError(msg, status, axiosErr.response?.data);
  }
}

// ─────────────────────────────────────────────────────────────
// Verb helpers (convenience)
// ─────────────────────────────────────────────────────────────
export function apiGet<T = any>(path: string, init: RequestInit = {}) {
  return apiJSON<T>(path, { ...init, method: "GET" });
}

export function apiPost<T = any>(path: string, body?: any, init: RequestInit = {}) {
  const isFD = body instanceof FormData;
  return apiJSON<T>(path, {
    ...init,
    method: "POST",
    body: isFD ? body : body === undefined ? undefined : body,
    headers: isFD ? { ...(init.headers as Record<string, string>) } : { "Content-Type": "application/json", ...(init.headers as Record<string, string>) },
  });
}

export function apiPut<T = any>(path: string, body?: any, init: RequestInit = {}) {
  const isFD = body instanceof FormData;
  return apiJSON<T>(path, {
    ...init,
    method: "PUT",
    body: isFD ? body : body === undefined ? undefined : body,
    headers: isFD ? { ...(init.headers as Record<string, string>) } : { "Content-Type": "application/json", ...(init.headers as Record<string, string>) },
  });
}

export function apiPatch<T = any>(path: string, body?: any, init: RequestInit = {}) {
  const isFD = body instanceof FormData;
  return apiJSON<T>(path, {
    ...init,
    method: "PATCH",
    body: isFD ? body : body === undefined ? undefined : body,
    headers: isFD ? { ...(init.headers as Record<string, string>) } : { "Content-Type": "application/json", ...(init.headers as Record<string, string>) },
  });
}

export function apiDelete<T = any>(path: string, init: RequestInit = {}) {
  return apiJSON<T>(path, { ...init, method: "DELETE" });
}