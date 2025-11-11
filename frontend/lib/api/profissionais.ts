// lib/api/profissionais.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

/**
 * Roles possíveis no backend (ROLE_CHOICES).
 */
export type ProfessionalRole = "Odontologista" | "Enfermeiro" | "ACS";

/**
 * Estrutura do objeto `user` esperado pela API de ProfessionalUser.
 */
export type ProfessionalUserApiUser = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  /** Opcional no update – só envia se for trocar a senha */
  password?: string;
};

/**
 * Estrutura básica retornada pela API de profissionais.
 * Ajuste se o backend tiver mais campos relevantes.
 */
export type ProfessionalApi = {
  id: number;
  user: ProfessionalUserApiUser & { id?: number };
  role: ProfessionalRole;
};

/**
 * Payload principal enviado para a API de profissionais.
 * IMPORTANTE: `role` deve bater com os ROLE_CHOICES do backend.
 */
export type ProfessionalApiPayload = {
  user: ProfessionalUserApiUser;
  role: ProfessionalRole;
};

/**
 * Criação de profissional.
 * O payload já deve vir no formato da API (user + role).
 */
export async function createProfissional<T = ProfessionalApi>(
  payload: ProfessionalApiPayload
): Promise<T> {
  return apiPost<T>("/api/v1/accounts/professionals/", payload);
}

/**
 * Atualização parcial (PATCH) de profissional.
 * Use quando for editar dados do profissional.
 */
export async function updateProfissional<T = ProfessionalApi>(
  id: number,
  payload: Partial<ProfessionalApiPayload>
): Promise<T> {
  return apiPatch<T>(`/api/v1/accounts/professionals/${id}/`, payload);
}

/**
 * Busca de um profissional pelo ID.
 */
export async function getProfissional<T = ProfessionalApi>(
  id: number
): Promise<T> {
  return apiGet<T>(`/api/v1/accounts/professionals/${id}/`);
}

/**
 * Lista de profissionais.
 * `searchParams` pode ser algo como "page=1&page_size=20".
 *
 * Por padrão, consideramos que a API pode retornar:
 *   - um array de ProfessionalApi; ou
 *   - um objeto paginado com `results: ProfessionalApi[]`.
 */
export async function listProfissionais<
  T = ProfessionalApi[] | { results: ProfessionalApi[] },
>(searchParams?: string): Promise<T> {
  const suffix = searchParams ? `?${searchParams}` : "";
  return apiGet<T>(`/api/v1/accounts/professionals/${suffix}`);
}

/**
 * Remoção (soft delete) de um profissional.
 */
export async function deleteProfissional<T = void>(id: number): Promise<T> {
  return apiDelete<T>(`/api/v1/accounts/professionals/${id}/`);
}
