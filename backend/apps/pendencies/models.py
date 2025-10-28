from django.db import models
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser
from apps.locations.models import MicroArea

# Create your models here.
class Pendency(BaseModel):
    class Meta:
        verbose_name = "Pendência"
        verbose_name_plural = "Pendências"

    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    micro_area = models.ForeignKey(MicroArea, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()

    def __str__(self):
        micro_area_name = self.micro_area.name if self.micro_area else "Sem microárea"
        return f"Pendency: {self.patient.user.get_full_name()} - {micro_area_name}"

#* Sugestão:
#* Caso o model Pendency seja mantido Pesquisar o que fazer para automatizar a questão de datas.