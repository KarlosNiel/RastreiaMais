// lib/api/pacientes.ts
import type { PatientApiPayload } from "@/lib/pacientes/mappers";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn(
    "[lib/api/pacientes] API_BASE ausente. Defina NEXT_PUBLIC_API_URL ou API_URL."
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

// Criação de paciente (payload já vem no formato da API via formToPatientApi)
export async function createPaciente<T = unknown>(payload: PatientApiPayload) {
  return http<T>("/api/v1/accounts/patients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Atualização parcial (PATCH) – também usa PatientApiPayload, mas sem user no modo edit
export async function updatePaciente<T = unknown>(
  id: number,
  payload: PatientApiPayload
) {
  return http<T>(`/api/v1/accounts/patients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// Opcional (client-side). Para server-side na page de edição você já usa fetchPaciente com cookies().
export async function getPaciente<T = unknown>(id: number) {
  return http<T>(`/api/v1/accounts/patients/${id}/`);
}
