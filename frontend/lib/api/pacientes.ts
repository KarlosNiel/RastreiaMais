// lib/api/pacientes.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";

type FetchOpts = RequestInit & { json?: boolean };

async function http<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { json = true, headers, ...rest } = opts;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }

  return (json ? res.json() : (res as unknown as T)) as T;
}

// Ajuste os tipos se quiser importar dos schemas:
// import type { RegistroPacienteCreate, RegistroPacienteEdit } from "@/schemas/paciente";

export async function createPaciente(payload: any) {
  // endpoint exemplo – ajuste para o do seu backend
  return http("/api/v1/accounts/patients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePaciente(id: number, payload: any) {
  // PATCH para edição parcial (bate com o schema .partial())
  return http(`/api/v1/accounts/patients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// opcional (usado na página de edição server-side)
export async function getPaciente(id: number) {
  return http(`/api/v1/accounts/patients/${id}/`);
}
