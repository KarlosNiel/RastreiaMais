from django.db import models

class AdoptedConductHASChoices(models.TextChoices):
    ACOMPANHAMENTO_APS = "ACOMPANHAMENTO_APS", "Acompanhamento na APS"
    ENCAMINHAMENTO_MEDICO = "ENCAMINHAMENTO_MEDICO", "Encaminhamento médico"
    ACONSELHAMENTO_GRUPO = "ACONSELHAMENTO_GRUPO", "Aconselhamento em grupo"

class FraminghamScoreChoices(models.TextChoices):
    BAIXO = "BAIXO", "<10% Baixo"
    MODERADO = "MODERADO", "10–20% Moderado"
    ALTO = "ALTO", ">20% Alto"

class BloodPressureClassificationChoices(models.TextChoices):
    NORMAL = "NORMAL", "Normal"
    PRE_HIPERTENSO = "PRE_HIPERTENSO", "Pré-hipertenso"
    HIPERTENSO_E1 = "HIPERTENSO_E1", "Hipertenso Estágio 1"
    HIPERTENSO_E2 = "HIPERTENSO_E2", "Hipertenso Estágio 2"
    HIPERTENSO_E3 = "HIPERTENSO_E3", "Hipertenso Estágio 3"

class HypertensionComplicationsChoices(models.TextChoices):
    AVC = "AVC", "AVC"
    INFARTO = "INFARTO", "Infarto"
    DOENCA_RENAL = "DOENCA_RENAL", "Doença renal"