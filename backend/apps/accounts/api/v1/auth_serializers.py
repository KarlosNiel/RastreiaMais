# backend/apps/accounts/api/v1/auth_serializers.py
import re
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.accounts.models_security import AccountLockout
from apps.commons.utils.audit import get_client_ip, log_security_event

User = get_user_model()


def normalize_digits(s: str) -> str:
    return re.sub(r"\D+", "", s or "")


def looks_like_cpf(s: str) -> bool:
    return len(normalize_digits(s)) == 11


class EmailOrUsernameOrCpfTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Permite login por:
      - username (padrão Django),
      - e-mail (User.email, case-insensitive),
      - CPF (PatientUser.cpf) -> mapeia para o username relacionado.
    Aceita CPF com ou sem máscara (ex.: 000.000.000-00).

    Possui proteção corporativa de Account Lockout contra ataques de força bruta:
    bloqueia temporariamente após 5 tentativas incorretas consecutivas.
    """

    def validate(self, attrs):
        login_raw = (attrs.get(self.username_field) or "").strip()
        request = self.context.get("request")
        ip = get_client_ip(request)

        # 1. Verifica se a conta está temporariamente bloqueada
        is_locked, remaining_secs = AccountLockout.is_identifier_locked(login_raw)
        if is_locked:
            minutes = max(1, (remaining_secs + 59) // 60)
            log_security_event(
                "LOGIN_BLOCKED_LOCKOUT",
                login_raw,
                f"Bloqueio ativo. Restam {minutes} min.",
                request=request
            )
            raise serializers.ValidationError({
                "detail": f"Conta temporariamente bloqueada por excesso de tentativas incorretas. Tente novamente em {minutes} minuto(s)."
            })

        credentials = attrs.copy()

        if login_raw:
            # 1) Tenta e-mail (contém @)
            if "@" in login_raw:
                try:
                    u = User.objects.get(email__iexact=login_raw)
                    credentials[self.username_field] = getattr(u, self.username_field)
                except User.DoesNotExist:
                    pass
            else:
                # 2) Tenta CPF (com máscara ou não)
                if looks_like_cpf(login_raw):
                    cpf = normalize_digits(login_raw)
                    try:
                        from apps.accounts.models import PatientUser
                        p = (PatientUser.objects
                                      .select_related("user")
                                      .get(cpf=cpf))
                        credentials[self.username_field] = getattr(p.user, self.username_field)
                    except PatientUser.DoesNotExist:
                        credentials[self.username_field] = login_raw
                else:
                    credentials[self.username_field] = login_raw

        try:
            validated_data = super().validate(credentials)
            # Sucesso: zera o contador de falhas para esse identificador
            AccountLockout.reset_attempts(login_raw)
            return validated_data
        except Exception as exc:
            # Falha de autenticação: registra a tentativa e verifica se deve bloquear
            lockout = AccountLockout.record_failure(login_raw, ip=ip, max_attempts=5, lockout_minutes=15)
            if lockout and lockout.is_locked():
                log_security_event(
                    "ACCOUNT_LOCKED",
                    login_raw,
                    "Limite de 5 tentativas consecutivas excedido. Bloqueado por 15 min.",
                    request=request
                )
                raise serializers.ValidationError({
                    "detail": "Limite de tentativas excedido. Conta bloqueada temporariamente por 15 minutos."
                }) from exc

            log_security_event(
                "LOGIN_FAILED",
                login_raw,
                f"Tentativa incorreta ({lockout.failed_attempts if lockout else 1}/5).",
                request=request
            )
            raise exc
