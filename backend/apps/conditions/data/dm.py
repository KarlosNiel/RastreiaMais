from django.db import models
from apps.conditions.constants import dm_choices

class ClinicalEvaluationDM(models.Model):
    """Avaliação Clínica para DM (Diabetes Mellitus)."""

    capillary_blood_glucose_random = models.CharField(
        "Glicemia Capilar Aleatória (mg/dL)", max_length=50, null=True, blank=True
    )
    fasting_capillary_blood_glucose = models.CharField(
        "Glicemia Capilar em Jejum (mg/dL)", max_length=50, null=True, blank=True
    )
    glycated_hemoglobin = models.CharField(
        "Hemoglobina Glicada (%)", max_length=50, null=True, blank=True
    )
    weight = models.DecimalField(
        "Peso (kg)", max_digits=5, decimal_places=2, null=True, blank=True
    )
    height = models.DecimalField(
        "Altura (m)", max_digits=4, decimal_places=2, null=True, blank=True
    )
    IMC = models.DecimalField(
        "IMC", max_digits=5, decimal_places=2, null=True, blank=True
    )
    abdominal_circumference = models.DecimalField(
        "Circunferência Abdominal (cm)", max_digits=5, decimal_places=2, null=True, blank=True
    )

    class Meta:
        abstract = True
        verbose_name = "Avaliação Clínica DM"
        verbose_name_plural = "Avaliações Clínicas DM"


class RiskFactorsDM(models.Model):
    """Fatores de Risco para DM (Diabetes Mellitus)."""

    age_over_45 = models.BooleanField(
        "Idade ≥ 45 anos", default=False
    )
    overweight_or_obesity_imc_25 = models.BooleanField(
        "Sobrepeso ou Obesidade (IMC ≥ 25)", default=False
    )
    physical_inactivity = models.BooleanField(
        "Inatividade Física", default=False
    )
    high_blood_pressure = models.BooleanField("Hipertensão Arterial", default=False)
    high_cholesterol_or_triglycerides = models.BooleanField("Colesterol ou Triglicerídeos Elevados", default=False)
    history_of_gestational_diabetes = models.BooleanField("Histórico de Diabetes Gestacional", default=False)
    polycystic_ovary_syndrome = models.BooleanField("Síndrome do Ovário Policístico", default=False)

    class Meta:
        abstract = True
        verbose_name = "Fator de Risco DM"
        verbose_name_plural = "Fatores de Risco DM"

class ClassificationConductDM(models.Model):
    """Classificação e Conduta para DM."""

    screening_result = models.CharField(
        "Resultado do Rastreamento", max_length=255, null=True, blank=True,
        choices=dm_choices.ScreeningResultChoices.choices
        
        )
    adopted_conduct = models.CharField(
        "Conduta Adotada", max_length=255, null=True, blank=True,
        choices=dm_choices.DiabetesAdoptedConductChoices.choices
    )
    adopted_conduct_other = models.TextField("Outra Conduta (Especificar)", null=True, blank=True)

    class Meta:
        abstract = True
        verbose_name = "Classificação e Conduta DM"
        verbose_name_plural = "Classificações e Condutas DM"