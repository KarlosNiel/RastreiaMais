from django.db import models

class DiabetesAdoptedConductChoices(models.TextChoices):
    CONFIRMACAO_LABORATORIAL = "CONFIRMACAO_LABORATORIAL", "Encaminhado para confirmação laboratorial"
    INICIO_TRATAMENTO = "INICIO_TRATAMENTO", "Início de tratamento"
    ORIENTACAO_NUTRICIONAL = "ORIENTACAO_NUTRICIONAL", "Orientação nutricional/educação em saúde"
    ENCAMINHAMENTO_MEDICO = "ENCAMINHAMENTO_MEDICO", "Encaminhamento médico"

class DiabetesComorbiditiesChoices(models.TextChoices):
    CARDIACA = "CARDIACA", "Cardíaca"
    RENAL = "RENAL", "Renal"
    VISUAL = "VISUAL", "Visual"
    VASCULAR = "VASCULAR", "Vascular"

class DiabetesTreatmentTypeChoices(models.TextChoices):
    MEDICAMENTOSO = "MEDICAMENTOSO", "Medicamentoso (oral)"
    INSULINA = "INSULINA", "Insulina"
    ALIMENTAR_ESTILO_VIDA = "ALIMENTAR_ESTILO_VIDA", "Alimentar/estilo de vida"

class ScreeningResultChoices(models.TextChoices):
    NORMAL = "NORMAL", "Normal"
    GLICEMIA_ALTERADA = "GLICEMIA_ALTERADA", "Glicemia alterada"
    SUSPEITA_DIABETES = "SUSPEITA_DIABETES", "Suspeita de diabetes"
    DIAGNOSTICO_CONFIRMADO = "DIAGNOSTICO_CONFIRMADO", "Diagnóstico confirmado"