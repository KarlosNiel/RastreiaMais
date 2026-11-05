from django.db import models
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser, ProfessionalUser
from apps.locations.models import MicroArea

PENDENCY_STATUS = [
    ('pendente', 'Pendente'),
    ('em_andamento', 'Em Andamento'),
    ('concluida', 'Concluída'),
]

PRIORITY_CHOICES = [
    ('baixa', 'Baixa'),
    ('media', 'Média'),
    ('alta', 'Alta'),
]

# Create your models here.
class Pendency(BaseModel):
    class Meta:
        verbose_name = "Pendência"
        verbose_name_plural = "Pendências"

    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    micro_area = models.ForeignKey(MicroArea, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PENDENCY_STATUS, default='pendente', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='media')
    due_date = models.DateField("Prazo limite", null=True, blank=True)
    assigned_to = models.ForeignKey(ProfessionalUser, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Profissional / ACS Responsável")
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        micro_area_name = self.micro_area.name if self.micro_area else "Sem microárea"
        return f"Pendency ({self.status}): {self.patient.user.get_full_name()} - {micro_area_name}"