// lib/api/pacientes.ts
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { PatientApiPayload } from "@/lib/pacientes/mappers";

/**
 * Criação de paciente.
 * O payload já vem pronto no formato da API via formToPatientApi.
 */
export async function createPaciente<T = unknown>(
  payload: PatientApiPayload
): Promise<T | null> {
  return apiPost<T>("/api/v1/accounts/patients/", payload);
}

export async function updatePaciente<T = unknown>(
  id: number,
  payload: PatientApiPayload
): Promise<T | null> {
  return apiPatch<T>(`/api/v1/accounts/patients/${id}/`, payload);
}

export async function getPaciente<T = unknown>(id: number): Promise<T | null> {
  return apiGet<T>(`/api/v1/accounts/patients/${id}/`);
}

/**
 * Verifica se um CPF já está cadastrado no sistema
 */
export async function checkCpfExists(cpf: string): Promise<{
  exists: boolean;
  message: string;
  patient?: { id: number; name: string };
} | null> {
  return apiGet(`/api/v1/accounts/patients/check-cpf/?cpf=${encodeURIComponent(cpf)}`);
}
