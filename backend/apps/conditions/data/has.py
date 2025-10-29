from django.db import models
from apps.conditions.constants import has_choices

class ClinicalEvaluationHAS(models.Model):
    """Avaliação Clínica para HAS (Hipertensão Arterial Sistêmica)."""

    BP_assessment1_1 = models.IntegerField("Pressão Arterial 1ª Avaliação (Sistólica)", null=True, blank=True)
    BP_assessment1_2 = models.IntegerField("Pressão Arterial 1ª Avaliação (Diastólica)", null=True, blank=True)
    BP_assessment2_1 = models.IntegerField("Pressão Arterial 2ª Avaliação (Sistólica)", null=True, blank=True)
    BP_assessment2_2 = models.IntegerField("Pressão Arterial 2ª Avaliação (Diastólica)", null=True, blank=True)
    weight = models.DecimalField("Peso (kg)", max_digits=5, decimal_places=2, null=True, blank=True)
    IMC = models.DecimalField("IMC", max_digits=5, decimal_places=2, null=True, blank=True)
    abdominal_circumference = models.DecimalField("Circunferência Abdominal (cm)", max_digits=5, decimal_places=2, null=True, blank=True)
    total_cholesterol = models.IntegerField("Colesterol Total (mg/dL)", null=True, blank=True)
    cholesterol_data = models.DateTimeField("Data da Coleta do Colesterol", null=True, blank=True)
    HDL_cholesterol = models.IntegerField("Colesterol HDL (mg/dL)", null=True, blank=True)
    HDL_data = models.DateTimeField("Data da Coleta do HDL", null=True, blank=True)

    class Meta:
        abstract = True
        verbose_name = "Avaliação Clínica HAS"
        verbose_name_plural = "Avaliações Clínicas HAS"

class ClassificationConductHAS(models.Model):
    """Classificação e Conduta para HAS."""

    BP_classifications = models.CharField(
        "Classificação da PA", max_length=100, null=True, blank=True,
        choices=has_choices.BloodPressureClassificationChoices.choices
    )
    framingham_score = models.CharField(
        "Escore de Framingham", max_length=100, null=True, blank=True,
        choices=has_choices.FraminghamScoreChoices.choices
    )
    conduct_adopted = models.CharField(
        "Conduta Adotada", max_length=255, null=True, blank=True,
        choices=has_choices.AdoptedConductHASChoices.choices
    )

    class Meta:
        abstract = True
        verbose_name = "Classificação e Conduta HAS"
        verbose_name_plural = "Classificações e Condutas HAS"