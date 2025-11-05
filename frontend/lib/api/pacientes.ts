// lib/api/pacientes.ts
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { PatientApiPayload } from "@/lib/pacientes/mappers";

/**
 * Criação de paciente.
 * O payload já vem pronto no formato da API via formToPatientApi.
 */
export async function createPaciente<T = unknown>(
  payload: PatientApiPayload
): Promise<T> {
  return apiPost<T>("/api/v1/accounts/patients/", payload);
}

/**
 * Atualização parcial (PATCH) de paciente.
 * No modo edit, o payload normalmente não inclui o objeto `user`.
 */
export async function updatePaciente<T = unknown>(
  id: number,
  payload: PatientApiPayload
): Promise<T> {
  return apiPatch<T>(`/api/v1/accounts/patients/${id}/`, payload);
}

/**
 * Busca de paciente (uso client-side).
 * Para server-side, você já tem helpers específicos usando cookies().
 */
export async function getPaciente<T = unknown>(id: number): Promise<T> {
  return apiGet<T>(`/api/v1/accounts/patients/${id}/`);
}
