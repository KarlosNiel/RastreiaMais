from django.db import models
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser, ProfessionalUser

# Create your models here.
RISK_CHOICES = [
    ('safe', 'Seguro'),
    ('moderate', 'Moderado'),
    ('critical', 'Crítico')
]

class Alert(BaseModel):
    class Meta:
        verbose_name = "Alerta"
        verbose_name_plural = "Alertas"
    
    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=150)
    description = models.TextField()
    risk_level = models.CharField(choices=RISK_CHOICES, max_length=20,  default='moderate')

    def __str__ (self):
        return f"[{self.risk_level}] {self.title}"
    
#* Sugestão de melhoria futura:
#* dependendo da necessidade criar dois campos resolved_by e resolved_at, mas acho que pode ser redundante ja que podemos usar o
#* deleted_at e o deleted_by jutamente com o soft_delete do BaseModel para diferenciar os alertas Pendentes ou Resolvidos.