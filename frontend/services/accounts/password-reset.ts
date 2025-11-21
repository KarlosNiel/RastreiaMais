import { apiPost } from "@/lib/api";

export interface PasswordResetRequestData {
  identifier: string;
}

export interface PasswordResetValidateData {
  token: string;
}

export interface PasswordResetConfirmData {
  token: string;
  password: string;
  password_confirm: string;
}

export interface PasswordResetRequestResponse {
  message: string;
}

export interface PasswordResetValidateResponse {
  valid: boolean;
  email?: string;
  username?: string;
  message?: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

/**
 * Solicita recuperação de senha
 */
export function requestPasswordReset(data: PasswordResetRequestData) {
  return apiPost<PasswordResetRequestResponse>(
    "/api/password-reset/request/",
    data
  );
}

/**
 * Valida um token de recuperação
 */
export function validateResetToken(data: PasswordResetValidateData) {
  return apiPost<PasswordResetValidateResponse>(
    "/api/password-reset/validate/",
    data
  );
}

/**
 * Confirma a nova senha
 */
export function confirmPasswordReset(data: PasswordResetConfirmData) {
  return apiPost<PasswordResetConfirmResponse>(
    "/api/password-reset/confirm/",
    data
  );
}
