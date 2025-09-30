from django.db import models
from django.utils.timezone import now
from apps.commons.models import BaseModel
from apps.accounts.models import PatientUser

# Create your models here.
class Medication(BaseModel):
    patient = models.ForeignKey(PatientUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    description = models.TextField()
    end_date = models.DateField()
    active = models.BooleanField()
    
    def is_active(self):
        if self.end_date == None or now().date() <= self.end_date:
            return True
        else:
            return False

    def finished(self):
        if self.is_active() == False:
            self.is_deleted = True

#* Sugestão de melhoria futura:
#* Se possivel Descobrir como fazer algo que automatize esse finished para que o valor mude automaticamente.
