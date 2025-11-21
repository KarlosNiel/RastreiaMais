// lib/api/medications.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

const BASE = "/api/v1/medications";
const MEDICATIONS_URL = `${BASE}/medications/`;

/**
 * Tipo básico da medicação que o backend devolve.
 * Ajuste se depois quiser tipar campos extras (created_at, etc.).
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
  const resp = await apiGet<MedicationsResponse | null>(MEDICATIONS_URL);

  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray((resp as any).results)) {
    return (resp as any).results;
  }
  return [];
}

/**
 * Cria uma nova medicação para um paciente.
 * - `patient` é obrigatório.
 *
 * Se a API retornar null, lança erro (para evitar seguir com dado indefinido).
 */
export async function createMedication(
  payload: Omit<MedicationDto, "id">
): Promise<MedicationDto> {
  const resp = await apiPost<MedicationDto | null>(MEDICATIONS_URL, payload);

  if (!resp) {
    throw new Error("Falha ao criar medicação: resposta vazia da API.");
  }

  return resp;
}

/**
 * Atualiza parcialmente uma medicação existente.
 *
 * Se a API retornar null, lança erro.
 */
export async function updateMedication(
  id: number,
  payload: Partial<Omit<MedicationDto, "id" | "patient">>
): Promise<MedicationDto> {
  const resp = await apiPatch<MedicationDto | null>(
    `${MEDICATIONS_URL}${id}/`,
    payload
  );

  if (!resp) {
    throw new Error("Falha ao atualizar medicação: resposta vazia da API.");
  }

  return resp;
}

/**
 * Remove (soft delete) uma medicação.
 */
export async function deleteMedication(id: number): Promise<void> {
  await apiDelete<null>(`${MEDICATIONS_URL}${id}/`);
}
