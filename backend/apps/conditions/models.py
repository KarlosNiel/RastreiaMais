from django.db import models
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser
from apps.conditions.constants import dm_choices, has_choices, dcnt_choices
from apps.conditions.data.dm import ClinicalEvaluationDM, ClassificationConductDM, RiskFactorsDM
from apps.conditions.data.has import ClinicalEvaluationHAS, ClassificationConductHAS


class DCNT(BaseModel):
    is_diagnosed = models.BooleanField(
        "Diagnóstico confirmado", null=True, blank=True
    )
    uses_medication = models.CharField(
        "Uso de medicação", max_length=25, null=True, blank=True,
        choices=dcnt_choices.TreatmentStatusChoices.choices
    )
    medications_name = models.TextField(
        "Nome dos medicamentos", null=True, blank=True
    )
    family_history = models.BooleanField(
        "Histórico familiar", null=True, blank=True
    )


class HAS(DCNT, ClinicalEvaluationHAS, ClassificationConductHAS):
    class Meta:
        verbose_name = "HAS"
        verbose_name_plural = "HASs"

    patient = models.OneToOneField(
        PatientUser,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Paciente"
    )

    any_complications_HBP = models.CharField(
        "Complicações relacionadas à pressão alta",
        max_length=30, null=True, blank=True,
        choices=has_choices.HypertensionComplicationsChoices.choices
    )
    

class DM(DCNT, ClinicalEvaluationDM, RiskFactorsDM, ClassificationConductDM):
    class Meta:
        verbose_name = "DM"
        verbose_name_plural = "DMs"

    patient = models.OneToOneField(
        PatientUser,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Paciente"
    )

    treatment_type = models.CharField(
        "Tipo de tratamento", max_length=30, null=True, blank=True,
        choices=dm_choices.DiabetesTreatmentTypeChoices.choices
    )
    treatment_type_other = models.TextField(
        "Outro tipo de tratamento", null=True, blank=True
    )
    diabetes_comorbidities = models.CharField(
        "Comorbidades em decorrência da diabetes",
        max_length=30, null=True, blank=True,
        choices=dm_choices.DiabetesComorbiditiesChoices.choices
    )
    diabetes_comorbidities_others = models.TextField(
        "Outras comorbidades", null=True, blank=True
    )
    diabetic_foot = models.BooleanField(
        "Presença de pé diabético", null=True, blank=True
    )
    diabetic_foot_member = models.CharField(
        "Membro afetado pelo pé diabético", max_length=100, null=True, blank=True
    )


class OtherDCNT(DCNT):
    class Meta:
        verbose_name = "Outra DCNT"
        verbose_name_plural = "Outras DCNT"
        constraints = [
            models.UniqueConstraint(
                fields=['patient', 'name'],
                name='unique_patient_other_dcnt'
            )
        ]

    patient = models.ForeignKey(
        PatientUser,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Paciente"
    )

    name = models.CharField(
        "Nome da DCNT", max_length=100, null=True, blank=True
    )

#* Sugestão de melhoria:
#* Fazer um metodo que caso o paciente seja deletado ele subistitua o paciente pelo seu nome.