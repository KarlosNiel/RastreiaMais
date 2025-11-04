// lib/api/conditions.ts
import type { DmApiPayload, HasApiPayload } from "@/lib/pacientes/mappers";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn(
    "[lib/api/conditions] API_BASE ausente. Defina NEXT_PUBLIC_API_URL ou API_URL."
  );
}

type FetchOpts = RequestInit & { json?: boolean };

async function http<T = unknown>(
  path: string,
  opts: FetchOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { json = true, headers, ...rest } = opts;

  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(json
        ? {
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        : {}),
      ...(headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }

  return (json ? res.json() : (res as unknown as T)) as T;
}

const BASE = "/api/v1/conditions";

/* =======================
   HAS (Hipertensão)
   ======================= */

/** Cria um caso de HAS para um paciente */
export async function createHAS<T = unknown>(payload: HasApiPayload) {
  return http<T>(`${BASE}/systolic-hypertension-cases/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Atualiza (PATCH) um caso de HAS existente */
export async function updateHAS<T = unknown>(
  id: number,
  payload: Partial<HasApiPayload>
) {
  return http<T>(`${BASE}/systolic-hypertension-cases/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* =======================
   DM (Diabetes Mellitus)
   ======================= */

/** Cria um caso de DM para um paciente */
export async function createDM<T = unknown>(payload: DmApiPayload) {
  return http<T>(`${BASE}/diabetes-mellitus-cases/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Atualiza (PATCH) um caso de DM existente */
export async function updateDM<T = unknown>(
  id: number,
  payload: Partial<DmApiPayload>
) {
  return http<T>(`${BASE}/diabetes-mellitus-cases/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
