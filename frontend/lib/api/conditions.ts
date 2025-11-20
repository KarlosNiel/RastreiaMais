// lib/api/conditions.ts
import { apiDelete, apiPatch, apiPost } from "@/lib/api";
import type { DmApiPayload, HasApiPayload } from "@/lib/pacientes/mappers";

const BASE = "/api/v1/conditions";

/* =======================
   HAS (Hipertensão)
   ======================= */

/**
 * Cria um caso de HAS para um paciente.
 */
export async function createHAS<T = unknown>(
  payload: HasApiPayload
): Promise<T | null> {
  return apiPost<T | null>(`${BASE}/systolic-hypertension-cases/`, payload);
}

/**
 * Atualiza parcialmente (PATCH) um caso de HAS existente.
 */
export async function updateHAS<T = unknown>(
  id: number,
  payload: Partial<HasApiPayload>
): Promise<T | null> {
  return apiPatch<T | null>(
    `${BASE}/systolic-hypertension-cases/${id}/`,
    payload
  );
}

/**
 * Remove um caso de HAS existente.
 */
export async function deleteHAS<T = unknown>(id: number): Promise<T | null> {
  return apiDelete<T | null>(`${BASE}/systolic-hypertension-cases/${id}/`);
}

/* =======================
   DM (Diabetes Mellitus)
   ======================= */

/**
 * Cria um caso de DM para um paciente.
 */
export async function createDM<T = unknown>(
  payload: DmApiPayload
): Promise<T | null> {
  return apiPost<T | null>(`${BASE}/diabetes-mellitus-cases/`, payload);
}

/**
 * Atualiza parcialmente (PATCH) um caso de DM existente.
 */
export async function updateDM<T = unknown>(
  id: number,
  payload: Partial<DmApiPayload>
): Promise<T | null> {
  return apiPatch<T | null>(`${BASE}/diabetes-mellitus-cases/${id}/`, payload);
}

/**
 * Remove um caso de DM existente.
 */
export async function deleteDM<T = unknown>(id: number): Promise<T | null> {
  return apiDelete<T | null>(`${BASE}/diabetes-mellitus-cases/${id}/`);
}
