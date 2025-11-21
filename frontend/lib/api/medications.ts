// lib/api/medications.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

const BASE = "/api/v1/medications";

/**
 * Tipo básico da medicação que o backend devolve.
 * Ajusta se depois você quiser tipar campos extras (created_at, etc.).
 */
export interface MedicationDto {
  id: number;
  patient: number;
  name: string;
  description: string;
  end_date: string | null;
  active: boolean;
  [key: string]: any;
}

type MedicationsResponse =
  | MedicationDto[]
  | {
      results: MedicationDto[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    };

/**
 * Lista medicações (para o usuário logado, o back já filtra se for paciente).
 */
export async function listMedications(): Promise<MedicationDto[]> {
  const resp = await apiGet<MedicationsResponse>(`${BASE}/medications/`);

  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray((resp as any).results)) {
    return (resp as any).results;
  }
  return [];
}

/**
 * Cria uma nova medicação para um paciente.
 * - `patient` é obrigatório.
 */
export async function createMedication(
  payload: Omit<MedicationDto, "id">
): Promise<MedicationDto> {
  return apiPost<MedicationDto>(`${BASE}/medications/`, payload);
}

/**
 * Atualiza parcialmente uma medicação existente.
 */
export async function updateMedication(
  id: number,
  payload: Partial<Omit<MedicationDto, "id" | "patient">>
): Promise<MedicationDto> {
  return apiPatch<MedicationDto>(`${BASE}/medications/${id}/`, payload);
}

/**
 * Remove (soft delete) uma medicação.
 */
export async function deleteMedication(id: number): Promise<void> {
  await apiDelete<void>(`${BASE}/medications/${id}/`);
}
