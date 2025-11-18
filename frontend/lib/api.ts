// api.ts (ou onde seu arquivo está)

// ─────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
function isBrowser() {
  return typeof window !== "undefined";
}

// Remove TODOS os cookies, incluindo PACIENTE/
function clearAllCookies() {
  if (!isBrowser()) return;

  document.cookie.split(";").forEach((c) => {
    const cookie = c.trim();
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  });
}

// ─────────────────────────────────────────────────────────────
// TOKEN STORAGE
// ─────────────────────────────────────────────────────────────

function getAccess() {
  if (!isBrowser()) return null;
  return localStorage.getItem("access") || sessionStorage.getItem("access");
}

function getRefresh() {
  if (!isBrowser()) return null;
  return localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
}

export function setTokens(
  access: string,
  refresh: string,
  persistent: boolean = true
) {
  if (!isBrowser()) return;

  if (persistent) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
  } else {
    sessionStorage.setItem("access", access);
    sessionStorage.setItem("refresh", refresh);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
}

export function clearTokens() {
  if (!isBrowser()) return;

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");

  clearAllCookies();
}

// ─────────────────────────────────────────────────────────────
// ERROR UTIL
// ─────────────────────────────────────────────────────────────

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

class ApiError extends Error {
  status: number;
  response?: any;
  constructor(msg: string, status: number, response?: any) {
    super(msg);
    this.status = status;
    this.name = "ApiError";
    this.response = response;
  }
}

// ─────────────────────────────────────────────────────────────
// REFRESH TOKEN LOGIC
// ─────────────────────────────────────────────────────────────

let refreshInFlight: Promise<string | null> | null = null;

async function ensureAccessToken(): Promise<string | null> {
  const refresh = getRefresh();
  if (!refresh) return null;

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API}/api/token/refresh/`, { refresh })
      .then((res) => {
        const newAccess = res.data?.access;
        if (newAccess) setTokens(newAccess, refresh);
        return newAccess ?? null;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

// ─────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────

function isAuthPath(path: string) {
  return path.startsWith("/api/token") || path.startsWith("/api/auth/login");
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API,
  withCredentials: false,
});

// Attach Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Se for FormData, não mexer no Content-Type
  if (
    typeof FormData !== "undefined" &&
    (config as any).data instanceof FormData
  ) {
    delete (config.headers as any)["Content-Type"];
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    if (!error.config || !error.response) return Promise.reject(error);

    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response.status;
    const path = original.url ?? "";
    if (status !== 401 || isAuthPath(path) || original._retry) {
      clearTokens();
      if (isBrowser()) window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    const newAccess = await ensureAccessToken();

    if (!newAccess) {
      clearTokens();
      if (isBrowser()) window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    original._retry = true;
    original.headers = original.headers ?? {};
    original.headers["Authorization"] = `Bearer ${newAccess}`;

    return axiosInstance(original);
  }
);

// ─────────────────────────────────────────────────────────────
// CORE REQUEST FUNCTION
// ─────────────────────────────────────────────────────────────

async function rawWithAxios(path: string, init: RequestInit) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = { ...(init.headers as Record<string, string>) };
  const data = (init as any).body;

  try {
    return await axiosInstance.request({ url: path, method, headers, data });
  } catch (e) {
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────
// JSON HELPERS
// ─────────────────────────────────────────────────────────────

export async function apiJSON<T = any>(path: string, init: RequestInit = {}) {
  try {
    const res = await rawWithAxios(path, init);
    return res.status === 204 || res.status === 205 ? null : (res.data as T);
  } catch (err: any) {
    const status = err.response?.status ?? 0;
    const msg = readErrorMessageFromAxios(err.response);
    throw new ApiError(msg, status, err.response?.data);
  }
}

export const apiRaw = rawWithAxios;

// ─────────────────────────────────────────────────────────────
// VERB HELPERS
// ─────────────────────────────────────────────────────────────

export const apiGet = <T = any>(path: string, init: RequestInit = {}) =>
  apiJSON<T>(path, { ...init, method: "GET" });

export const apiPost = <T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) =>
  apiJSON<T>(path, {
    ...init,
    method: "POST",
    body,
    headers: {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init.headers as any),
    },
  });

export const apiPut = <T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) =>
  apiJSON<T>(path, {
    ...init,
    method: "PUT",
    body,
    headers: {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init.headers as any),
    },
  });

export const apiPatch = <T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) =>
  apiJSON<T>(path, {
    ...init,
    method: "PATCH",
    body,
    headers: {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init.headers as any),
    },
  });

export const apiDelete = <T = any>(path: string, init: RequestInit = {}) =>
  apiJSON<T>(path, { ...init, method: "DELETE" });
