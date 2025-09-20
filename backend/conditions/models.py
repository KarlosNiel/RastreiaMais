from django.db import models
from commons.models import BaseModel
from accounts.models import PatientUser

# Create your models here.
class DCNT(BaseModel):
    patient = models.ForeignKey(PatientUser, on_delete=models.SET_NULL, null=True, blank=True)
    is_diagnosed = models.BooleanField(null=True, blank=True)
    uses_medication = models.BooleanField(null=True, blank=True)
    medications_name = models.TextField(null=True, blank=True)
    family_history = models.BooleanField(null=True, blank=True)

class HAS(DCNT):
    COMPLICATIONS_CHOICES = [
        ('AVC', 'AVC'),
        ('Infarto', 'Infarto'),
    ]
    any_complications_HBP = models.CharField(choices=COMPLICATIONS_CHOICES, max_length=30, null=True, blank=True)

class DM(DCNT):
    TREATMENT_TYPE_CHOICES = [
        ('Oral', 'Oral'),
        ('Insulina', 'Insulina'),
    ]
    COMORBIDITIES_CHOICES = [
        ('Cardiaca', 'Cardiaca'),
        ('Renal', 'Renal'),
    ]
    treatment_type = models.CharField(choices=TREATMENT_TYPE_CHOICES, max_length=30, null=True, blank=True)
    treatment_type_other = models.TextField(null=True, blank=True)
    diabetes_comorbidities = models.CharField(choices=COMORBIDITIES_CHOICES, max_length=30, null=True, blank=True)
    diabetes_comorbidities_others = models.TextField(null=True, blank=True)
    diabetic_foot = models.BooleanField(null=True, blank=True)
    diabetic_foot_member = models.CharField(max_length=100, null=True, blank=True)

class OtherDCNT(DCNT):
    name = models.CharField(max_length=100, null=True, blank=True)

#* Sugestão de melhoria:
#* Fazer um metodo que caso o paciente seja deletado ele subistitua o paciente pelo seu nome.