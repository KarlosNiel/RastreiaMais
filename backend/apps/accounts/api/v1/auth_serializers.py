# backend/apps/accounts/api/v1/auth_serializers.py
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re

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
    """

    def validate(self, attrs):
        login_raw = (attrs.get(self.username_field) or "").strip()
        credentials = attrs.copy()

        if login_raw:
            # 1) Tenta e-mail (contém @)
            if "@" in login_raw:
                try:
                    u = User.objects.get(email__iexact=login_raw)
                    credentials[self.username_field] = getattr(u, self.username_field)
                    # segue para validar a senha
                except User.DoesNotExist:
                    # se não achou por e-mail, cai para tentativas abaixo
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
                        # segue para validar a senha
                    except PatientUser.DoesNotExist:
                        # 3) Senão, fica valendo o que veio (username padrão)
                        credentials[self.username_field] = login_raw
                else:
                    # Sem @ e sem 11 dígitos -> assume username
                    credentials[self.username_field] = login_raw

        return super().validate(credentials)
