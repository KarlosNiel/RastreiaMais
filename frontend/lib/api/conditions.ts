// lib/api/conditions.ts
import { apiPatch, apiPost } from "@/lib/api";
import type { DmApiPayload, HasApiPayload } from "@/lib/pacientes/mappers";

const BASE = "/api/v1/conditions";

/* =======================
   HAS (Hipertensão)
   ======================= */

/** Cria um caso de HAS para um paciente */
export async function createHAS<T = unknown>(
  payload: HasApiPayload
): Promise<T> {
  return apiPost<T>(`${BASE}/systolic-hypertension-cases/`, payload);
}

/** Atualiza (PATCH) um caso de HAS existente */
export async function updateHAS<T = unknown>(
  id: number,
  payload: Partial<HasApiPayload>
): Promise<T> {
  return apiPatch<T>(`${BASE}/systolic-hypertension-cases/${id}/`, payload);
}

/* =======================
   DM (Diabetes Mellitus)
   ======================= */

/** Cria um caso de DM para um paciente */
export async function createDM<T = unknown>(payload: DmApiPayload): Promise<T> {
  return apiPost<T>(`${BASE}/diabetes-mellitus-cases/`, payload);
}

/** Atualiza (PATCH) um caso de DM existente */
export async function updateDM<T = unknown>(
  id: number,
  payload: Partial<DmApiPayload>
): Promise<T> {
  return apiPatch<T>(`${BASE}/diabetes-mellitus-cases/${id}/`, payload);
}
