import { get, post, patch, del, put } from "../../lib/api";

export function getPatients(token: string) {
  return get("/api/v1/accounts/patients/", { authToken: token });
}
export function createPatient(data: any, token: string) {
  return post("/api/v1/accounts/patients/", data, { authToken: token });
}

export function replacePatient(id: number, data: any, token: string) {
  return put(`/api/v1/accounts/patients/${id}/`, data, { authToken: token });
}

export function updatePatient(id: number, data: any, token: string) {
  return patch(`/api/v1/accounts/patients/${id}/`, data, { authToken: token });
}

export function deletePatient(id: number, token: string) {
  return del(`/api/v1/accounts/patients/${id}/`, { authToken: token });
}

export function restorePatient(id: number, token: string) {
  return patch(`/api/v1/accounts/patients/${id}/restore`, {}, {authToken: token})
}

