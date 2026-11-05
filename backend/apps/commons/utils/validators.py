import re
from django.conf import settings
from rest_framework.exceptions import ValidationError


def normalize_digits(value: str) -> str:
    """Remove todos os caracteres não numéricos."""
    if not value:
        return ""
    return re.sub(r"\D", "", str(value))


def validate_brazilian_cpf(value: str) -> str:
    """
    Valida e normaliza um CPF brasileiro (11 dígitos).
    Aplica o algoritmo canônico de Módulo 11 para verificação dos dígitos verificadores.
    Respeita a configuração settings.STRICT_CPF_VALIDATION (padrão: True em produção,
    False se em modo DEBUG/teste com CPFs sintéticos).
    """
    if not value:
        return ""

    digits = normalize_digits(value)

    if len(digits) != 11:
        raise ValidationError("O CPF deve conter exatamente 11 dígitos numéricos.")

    # Rejeita CPFs formados por números repetidos (ex: 11111111111, 00000000000)
    if digits == digits[0] * 11:
        strict_mode = getattr(settings, "STRICT_CPF_VALIDATION", not getattr(settings, "DEBUG", True))
        if strict_mode:
            raise ValidationError("CPF inválido: sequência com dígitos repetidos não é permitida.")
        return digits

    # Verificação de dígitos verificadores (Módulo 11)
    strict_mode = getattr(settings, "STRICT_CPF_VALIDATION", not getattr(settings, "DEBUG", True))
    if strict_mode:
        # Primeiro dígito verificador
        sum_1 = sum(int(digits[i]) * (10 - i) for i in range(9))
        remainder_1 = (sum_1 * 10) % 11
        dv1 = 0 if remainder_1 >= 10 else remainder_1

        if dv1 != int(digits[9]):
            raise ValidationError("CPF inválido: primeiro dígito verificador incorreto.")

        # Segundo dígito verificador
        sum_2 = sum(int(digits[i]) * (11 - i) for i in range(10))
        remainder_2 = (sum_2 * 10) % 11
        dv2 = 0 if remainder_2 >= 10 else remainder_2

        if dv2 != int(digits[10]):
            raise ValidationError("CPF inválido: segundo dígito verificador incorreto.")

    return digits


def validate_cns(value: str) -> str:
    """
    Valida e normaliza o número do Cartão Nacional de Saúde (CNS / SUS) - 15 dígitos.
    Baseado nas regras e algoritmos oficiais do DataSUS (Portaria SAS/MS nº 940/2011).
    """
    if not value:
        return ""

    digits = normalize_digits(value)

    if len(digits) != 15:
        raise ValidationError("O Cartão SUS (CNS) deve conter exatamente 15 dígitos numéricos.")

    strict_mode = getattr(settings, "STRICT_CNS_VALIDATION", not getattr(settings, "DEBUG", True))
    if not strict_mode:
        return digits

    first_digit = digits[0]
    if first_digit in ("1", "2"):
        # CNS Definitivo
        soma = sum(int(digits[i]) * (15 - i) for i in range(11))
        resto = soma % 11
        dv = 11 - resto
        if dv == 11:
            dv = 0
        if dv == 10:
            soma = sum(int(digits[i]) * (15 - i) for i in range(11)) + 2
            resto = soma % 11
            dv = 11 - resto
            resultado = digits[:11] + "001" + str(dv)
        else:
            resultado = digits[:11] + "000" + str(dv)

        if digits != resultado:
            raise ValidationError("Número de Cartão Nacional de Saúde (CNS) definitivo inválido.")

    elif first_digit in ("7", "8", "9"):
        # CNS Provisório
        soma = sum(int(digits[i]) * (15 - i) for i in range(15))
        if soma % 11 != 0:
            raise ValidationError("Número de Cartão Nacional de Saúde (CNS) provisório inválido.")
    else:
        raise ValidationError("Número de Cartão Nacional de Saúde (CNS) deve iniciar com 1, 2, 7, 8 ou 9.")

    return digits
