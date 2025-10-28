from django.db import models

class FeedingChoices(models.TextChoices):
    SAUDAVEL = "SAUDAVEL", "Saudável"
    PARCIALMENTE = "PARCIALMENTE", "Parcialmente Saudável"
    POUCO = "POUCO", "Pouco Saudável"

class SaltConsumptionChoices(models.TextChoices):
    ADEQUADO = "ADEQUADO", "Adequado"
    EXAGERADO = "EXAGERADO", "Exagerado"
    NAO_SABE = "NAO_SABE", "Não sabe"

class AlcoholConsumptionChoices(models.TextChoices):
    NAO_BEBE = "NAO_BEBE", "Não bebe"
    SOCIALMENTE = "SOCIALMENTE", "Socialmente"
    FREQUENTEMENTE = "FREQUENTEMENTE", "Frequentemente"

class SmokingChoices(models.TextChoices):
    NUNCA_FUMOU = "NUNCA_FUMOU", "Nunca fumou"
    EX_FUMANTE = "EX_FUMANTE", "Ex-fumante"
    FUMANTE_ATUAL = "FUMANTE_ATUAL", "Fumante atual"

class LastCheckChoices(models.TextChoices):
    NAO_CONSTA = "NAO_CONSTA", "N/A"
    SETE_DIAS = "7_DIAS", "7 dias"
    QUINZE_DIAS = "15_DIAS", "15 dias"
    TRINTA_DIAS = "30_DIAS", "30 dias"
    SESSENTA_DIAS = "60_DIAS", "60 dias"
    NOVENTA_DIAS = "90_DIAS", "90 dias"
    SEIS_MESES = "6_MESES", "6 meses"
    UM_ANO = "1_ANO", "1 ano"
    MAIS_DE_UM_ANO = "MAIS_DE_1_ANO", "> 1 ano"

class EducationLevelChoices(models.TextChoices):
    FUNDAMENTAL_INCOMPLETO = "FUND_INCOMPL", "Fundamental Incompleto"
    FUNDAMENTAL_COMPLETO = "FUND_COMPL", "Fundamental Completo"
    MEDIO_INCOMPLETO = "MED_INCOMPL", "Médio Incompleto"
    MEDIO_COMPLETO = "MED_COMPL", "Médio Completo"
    SUPERIOR_INCOMPLETO = "SUP_INCOMPL", "Superior Incompleto"
    SUPERIOR_COMPLETO = "SUP_COMPL", "Superior Completo"
    ANALFABETO = "ANALFABETO", "Sem escolaridade / Analfabeto"


class MaritalStatusChoices(models.TextChoices):
    SOLTEIRO = "SOLTEIRO", "Solteiro(a)"
    CASADO = "CASADO", "Casado(a)"
    UNIAO_ESTAVEL = "UNIAO_ESTAVEL", "União estável"
    VIUVO = "VIUVO", "Viúvo(a)"
    SEPARADO = "SEPARADO", "Separado(a) / Divorciado(a)"

class TransmissibleDiseaseChoices(models.TextChoices):
    CHAGAS = "CHAGAS", "Doença de Chagas"
    LEISHMANIOSE = "LEISHMANIOSE", "Leishmaniose"
    TUBERCULOSE = "TUBERCULOSE", "Tuberculose"
    TOXOPLASMOSE = "TOXOPLASMOSE", "Toxoplasmose"
    ESPOROTRICOSE = "ESPOROTRICOSE", "Esporotricose"
    HANSENIASE = "HANSENIASE", "Hanseníase"

class ReferralProfessionChoices(models.TextChoices):
    PSICOLOGO = "PSICOLOGO", "Psicólogo"
    MEDICO_VETERINARIO = "MEDICO_VETERINARIO", "Médico Veterinário"
    FISIOTERAPEUTA = "FISIOTERAPEUTA", "Fisioterapeuta"
    ASSISTENTE_SOCIAL = "ASSISTENTE_SOCIAL", "Assistente Social"
    ENFERMEIRA = "ENFERMEIRA", "Enfermeira"
    NUTRICIONISTA = "NUTRICIONISTA", "Nutricionista"
    CIRURGIA_DENTISTA = "CIRURGIA_DENTISTA", "Cirurgiã-Dentista"