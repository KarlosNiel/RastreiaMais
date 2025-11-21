// frontend/lib/api/locations.ts
import { apiGet, apiPatch, apiPost } from "@/lib/api";

export type AddressApiPayload = {
  uf: string; // ex.: "PB", "PE"
  city: string;
  district: string;
  street: string;
  number: number;
  complement?: string | null;
  zipcode?: string | null;
};

/**
 * Helper interno para garantir que a API não retorne `null`/`undefined`.
 */
function ensureResponse<T>(res: T | null | undefined, msg: string): T {
  if (res == null) {
    throw new Error(msg);
  }
  return res;
}

/**
 * Cria um endereço na API `/api/v1/locations/address/`
 * e retorna o objeto criado (inclusive o `id`).
 */
export async function createAddress<T = { id: number }>(
  payload: AddressApiPayload
): Promise<T> {
  const res = await apiPost<T>("/api/v1/locations/address/", payload);
  return ensureResponse(
    res,
    "Falha ao criar endereço. A API retornou resposta vazia."
  );
}

/**
 * Busca um endereço existente pelo ID em `/api/v1/locations/address/:id/`.
 */
export async function getAddress<T = any>(id: number): Promise<T> {
  const res = await apiGet<T>(`/api/v1/locations/address/${id}/`);
  return ensureResponse(res, "Endereço não encontrado.");
}

/**
 * Atualiza um endereço existente em `/api/v1/locations/address/:id/`.
 */
export async function updateAddress<T = { id: number }>(
  id: number,
  payload: AddressApiPayload
): Promise<T> {
  const res = await apiPatch<T>(`/api/v1/locations/address/${id}/`, payload);
  return ensureResponse(
    res,
    "Falha ao atualizar endereço. A API retornou resposta vazia."
  );
}

// Tipo básico da instituição (ajuste se o serializer mudar)
export type InstitutionApi = {
  id: number;
  name: string;
  maps_localization?: string | null;
  address?: number | null;
};

/**
 * Lista instituições em `/api/v1/locations/institutions/`.
 */
export async function listInstitutions(): Promise<InstitutionApi[]> {
  const res = await apiGet<InstitutionApi[]>("/api/v1/locations/institutions/");
  return ensureResponse(
    res,
    "Falha ao carregar instituições. A API retornou resposta vazia."
  );
}
