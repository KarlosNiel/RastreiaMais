// lib/api/pacientes.ts
import type { PatientApiPayload } from "@/lib/pacientes/mappers";

import { apiGet, apiPatch, apiPost } from "@/lib/api";

/**
 * Criação de paciente.
 * O payload já vem pronto no formato da API via formToPatientApi.
 */
export async function createPaciente<T = unknown>(
  payload: PatientApiPayload,
): Promise<T | null> {
  return apiPost<T>("/api/v1/accounts/patients/", payload);
}

export async function updatePaciente<T = unknown>(
  id: number,
  payload: PatientApiPayload,
): Promise<T | null> {
  return apiPatch<T>(`/api/v1/accounts/patients/${id}/`, payload);
}

export async function getPaciente<T = unknown>(id: number): Promise<T | null> {
  return apiGet<T>(`/api/v1/accounts/patients/${id}/`);
}
