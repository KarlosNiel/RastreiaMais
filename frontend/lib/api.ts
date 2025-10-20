// lib/api.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  authToken?: string; // JWT (opcional)
  signal?: AbortSignal;
  cache?: RequestCache; // ex.: "no-store"
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  });
  if (opts.authToken) headers.set("Authorization", `Bearer ${opts.authToken}`);

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: opts.cache ?? "no-store",
    // credenciais se backend usar cookies httpOnly:
    // credentials: "include",
  });

  // tenta ler JSON sempre que possível
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      (data as any)?.detail ||
      (data as any)?.message ||
      `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

// Açúcares sintáticos
export const get = <T>(p: string, o: ApiOptions = {}) =>
  api<T>(p, { ...o, method: "GET" });
export const post = <T>(p: string, body?: unknown, o: ApiOptions = {}) =>
  api<T>(p, { ...o, method: "POST", body });
export const put = <T>(p: string, body?: unknown, o: ApiOptions = {}) =>
  api<T>(p, { ...o, method: "PUT", body });
export const patch = <T>(p: string, body?: unknown, o: ApiOptions = {}) =>
  api<T>(p, { ...o, method: "PATCH", body });
export const del = <T>(p: string, o: ApiOptions = {}) =>
  api<T>(p, { ...o, method: "DELETE" });


