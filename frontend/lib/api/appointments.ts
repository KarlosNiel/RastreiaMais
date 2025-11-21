// lib/api/appointments.ts
import { apiDelete, apiPatch, apiPost } from "@/lib/api";
import type { AppointmentApiPayload } from "@/lib/pacientes/mappers";

const BASE = "/api/v1/appointments";

/* =======================
   APPOINTMENTS (Agendamentos)
   ======================= */

/**
 * Cria um agendamento (Appointment) vinculado a um paciente.
 * O backend já filtra por profissional conforme o usuário logado.
 */
export async function createAppointment<T = unknown>(
  payload: AppointmentApiPayload
): Promise<T | null> {
  return apiPost<T | null>(`${BASE}/appointments/`, payload);
}

/**
 * Atualiza parcialmente (PATCH) um agendamento existente.
 * Útil para mudar data, status, etc.
 */
export async function updateAppointment<T = unknown>(
  id: number,
  payload: Partial<AppointmentApiPayload> & { status?: string }
): Promise<T | null> {
  return apiPatch<T | null>(`${BASE}/appointments/${id}/`, payload);
}

/**
 * Remove um agendamento.
 * Se o ViewSet usar BaseModelViewSet com soft delete, isso fará o "delete lógico".
 */
export async function deleteAppointment(id: number): Promise<void> {
  await apiDelete<null>(`${BASE}/appointments/${id}/`);
}
