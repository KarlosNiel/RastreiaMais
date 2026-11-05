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
    ('Retorno', 'Retorno'),
    ('Avaliação', 'Avaliação'),
    ('Outro', 'Outro'),
]

STATUS_CHOICES = [
    ('ativo', 'Ativo'),
    ('finalizado', 'Finalizado'),
    ('cancelado', 'Cancelado')
]

class Appointment(BaseModel):
    class Meta:
        verbose_name = "Agendamento"
        verbose_name_plural = "Agendamentos"
        indexes = [
            models.Index(fields=['professional', 'scheduled_datetime']),
            models.Index(fields=['patient', 'scheduled_datetime']),
            models.Index(fields=['status', 'risk_level']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['professional', 'scheduled_datetime'],
                condition=models.Q(is_deleted=False) & ~models.Q(status='cancelado'),
                name='unique_active_professional_appointment_slot'
            )
        ]

    patient = models.ForeignKey(PatientUser, on_delete=models.PROTECT)
    professional = models.ForeignKey(ProfessionalUser, on_delete=models.PROTECT)
    scheduled_datetime = models.DateTimeField(db_index=True)
    local = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    risk_level = models.CharField(choices=RISK_LEVEL, max_length=20, db_index=True)
    description = models.TextField(null=True)
    type = models.CharField(choices=TYPE_CHOICES, max_length=20)
    status = models.CharField(choices=STATUS_CHOICES, null=True, blank=True, db_index=True)
    referral_professionals = models.TextField(
        "Profissionais para consulta",
        null=True, blank=True,
        help_text="Códigos dos profissionais separados por vírgula (ex.: PSICOLOGO,NUTRICIONISTA)"
    )

    def __str__(self):
        return f"{self.patient} - {self.scheduled_datetime.strftime('%d/%m/%Y %H:%M')}"

#* Sugestão de melhoria futura:
#* Se possivel fazer com que o modelo não seja deletado se patient e professional forem deletados para que os dados de que houve uma
#* consulta ainda persistam.
