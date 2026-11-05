from django.db import models
from django.utils.timezone import now
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser, ProfessionalUser

# Create your models here.
class Medication(BaseModel):
    class Meta:
        verbose_name = "Medicação"
        verbose_name_plural = "Medicações"
        indexes = [
            models.Index(fields=['patient', 'active']),
        ]
        
    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    dosage = models.CharField("Dosagem", max_length=100, null=True, blank=True, help_text="Ex: 50mg, 850mg")
    frequency = models.CharField("Posologia / Frequência", max_length=100, null=True, blank=True, help_text="Ex: 1 comprimido a cada 12h")
    description = models.TextField(null=True, blank=True)
    start_date = models.DateField("Data de início", null=True, blank=True)
    end_date = models.DateField("Data de término prevista", null=True, blank=True)
    prescribed_by = models.ForeignKey(ProfessionalUser, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Profissional Prescritor")
    active = models.BooleanField(default=True, db_index=True)
    
    def is_active(self):
        if self.end_date is None:
            return self.active
        return self.active and (now().date() <= self.end_date)

    def finished(self):
        if self.is_active() == False:
            self.active = False
            self.is_deleted = True
            self.save()
