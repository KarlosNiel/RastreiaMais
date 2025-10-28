from django.db import models
from apps.accounts.models import *
from apps.locations.models import Institution
from apps.commons.models import BaseModel

# Create your models here.
RISK_LEVEL = [
    ('Seguro', 'Seguro'),
    ('Moderado', 'Moderado'),
    ('Crítico', 'Crítico')
]

TYPE_CHOICES = [
    ('Consulta', 'Consulta'),
    ('Exame', 'Exame'),
    ('Evento', 'Evento')
]

STATUS_CHOICES = [
    ('Finalizado', 'Criado'),
    ('Agendado', 'Agendado'),
    ('Cancelado', 'Cancelado')
]

class Appointment(BaseModel):
    class Meta:
        verbose_name = "Agendamento"
        verbose_name_plural = "Agendamentos"

    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    professional = models.ForeignKey(ProfessionalUser, on_delete=models.CASCADE)
    scheduled_datetime = models.DateTimeField()
    local = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    risk_level = models.CharField(choices=RISK_LEVEL, max_length=20)
    description = models.TextField(null=True)
    type = models.CharField(choices=TYPE_CHOICES, max_length=20)
    status = models.CharField(choices=STATUS_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"{self.patient} - {self.scheduled_datetime.strftime('%d/%m/%Y %H:%M')}"

#* Sugestão de melhoria futura:
#* Se possivel fazer com que o modelo não seja deletado se patient e professional forem deletados para que os dados de que houve uma
#* consulta ainda persistam.
