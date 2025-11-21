from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
import re

User = get_user_model()


def normalize_digits(s: str) -> str:
    """Remove todos os caracteres não numéricos"""
    return re.sub(r"\D+", "", s or "")


def looks_like_cpf(s: str) -> bool:
    """Verifica se a string parece um CPF (11 dígitos)"""
    return len(normalize_digits(s)) == 11


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar recuperação de senha.
    Aceita email, username ou CPF.
    """
    identifier = serializers.CharField(
        required=True,
        help_text="Email, username ou CPF do usuário"
    )

    def validate_identifier(self, value):
        """Valida e normaliza o identificador"""
        return value.strip()

    def get_user(self):
        """
        Tenta encontrar o usuário pelo identificador fornecido.
        Retorna None se não encontrar (por segurança, não revelamos isso).
        """
        identifier = self.validated_data.get('identifier', '').strip()
        
        if not identifier:
            return None

        # 1) Tenta por email
        if "@" in identifier:
            try:
                return User.objects.get(email__iexact=identifier)
            except User.DoesNotExist:
                return None

        # 2) Tenta por CPF (pacientes)
        if looks_like_cpf(identifier):
            cpf = normalize_digits(identifier)
            try:
                patient = PatientUser.objects.select_related('user').get(cpf=cpf)
                return patient.user
            except PatientUser.DoesNotExist:
                pass

        # 3) Tenta por username
        try:
            return User.objects.get(username=identifier)
        except User.DoesNotExist:
            return None


class PasswordResetValidateSerializer(serializers.Serializer):
    """Serializer para validar um token de recuperação"""
    token = serializers.CharField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer para confirmar a nova senha"""
    token = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        min_length=8,
        write_only=True,
        help_text="Nova senha (mínimo 8 caracteres)"
    )
    password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        help_text="Confirmação da nova senha"
    )

    def validate(self, data):
        """Valida se as senhas coincidem"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'As senhas não coincidem.'
            })
        return data
