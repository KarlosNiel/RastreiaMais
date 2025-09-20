from django.db import models
from commons.models import BaseModel
from accounts.models import PatientUser
from locations.models import MicroArea

# Create your models here.
class Pendency(BaseModel):
    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    micro_area = models.ForeignKey(MicroArea, on_delete=models.SET_NULL, null=True, blank=True)

#* Sugestão:
#* Caso o model Pendency seja mantido Pesquisar o que fazer para automatizar a questão de datas.