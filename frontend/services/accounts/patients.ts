import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from "../../lib/api";

export function getPatients() {
  return apiGet("/api/v1/accounts/patients/");
}

export function createPatient(data: any) {
  return apiPost("/api/v1/accounts/patients/", data);
}

export function replacePatient(id: number, data: any) {
  return apiPut(`/api/v1/accounts/patients/${id}/`, data);
}

export function updatePatient(id: number, data: any) {
  return apiPatch(`/api/v1/accounts/patients/${id}/`, data);
}

export function deletePatient(id: number) {
  return apiDelete(`/api/v1/accounts/patients/${id}/`);
}

export function restorePatient(id: number) {
  return apiPatch(`/api/v1/accounts/patients/${id}/restore`, {});
}

