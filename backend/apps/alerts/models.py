from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser

# Create your models here.
RISK_CHOICES = [
    ('safe', 'Seguro'),
    ('moderate', 'Moderado'),
    ('critical', 'Crítico')
]

ALERT_STATUS_CHOICES = [
    ('pending', 'Pendente'),
    ('resolved', 'Resolvido'),
]

class Alert(BaseModel):
    class Meta:
        verbose_name = "Alerta"
        verbose_name_plural = "Alertas"
        indexes = [
            models.Index(fields=['patient', 'risk_level']),
            models.Index(fields=['status', 'risk_level']),
        ]
    
    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=150)
    description = models.TextField()
    risk_level = models.CharField(choices=RISK_CHOICES, max_length=20, default='moderate', db_index=True)
    status = models.CharField(choices=ALERT_STATUS_CHOICES, max_length=20, default='pending', db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')
    resolution_notes = models.TextField(null=True, blank=True)

    def __str__ (self):
        return f"[{self.risk_level}] {self.title}"

    def resolve(self, user=None, notes=None):
        """Marca o alerta como resolvido com registro de data, usuário e notas de conduta"""
        self.status = 'resolved'
        self.resolved_at = now()
        if user:
            self.resolved_by = user
        if notes:
            self.resolution_notes = notes
        self.save(update_fields=['status', 'resolved_at', 'resolved_by', 'resolution_notes'])