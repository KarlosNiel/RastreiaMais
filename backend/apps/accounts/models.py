from django.db import models
from django.contrib.auth.models import User
from apps.commons.models import BaseModel
from django.core.exceptions import ValidationError
from apps.accounts.utils import get_creator_profile

# Create your models here.

ROLE_CHOICES = [
    ("Odontologista", "Odontologista"),
    ("Enfermeiro", "Enfermeiro"),
    ("ACS", "ACS"),
]

#Patient=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class PatientUser(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Patient: {self.user.get_full_name()}"
    
    def clean(self):
        super().clean()

        #* Permite Apenas que Gestor e Profissional criem pacientes
        if self.created_by and not self.pk: 
            creator = self.get_creator_profile(self.created_by)
            if creator:
                valid = isinstance(creator, (ManagerUser, ProfessionalUser))
                if not valid and not self.created_by.is_staff:
                    raise ValidationError('Apenas Gestores ou Profissionais podem criar Pacientes.')

#Professional=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class ProfessionalUser(BaseModel): 
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(choices=ROLE_CHOICES, max_length=100)

    def __str__(self):
        return f"{self.role}: {self.user.get_full_name()}"

    def clean(self):
        super().clean()

        #* Permite Apenas que Gestor crie pacientes
        if self.created_by and not self.pk: #* Se houver um criador e o objeto não foi criado ainda.
            creator = self.get_creator_profile(self.created_by)
            if creator and not isinstance(creator, ManagerUser):
                if not self.created_by.is_staff:
                    raise ValidationError("Apenas Gestores podem criar Profissionais")



#Manager=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class ManagerUser(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=50)

    def __str__(self):
        return f"Manager: {self.user.get_full_name()}"
    
    def clean(self):
        super().clean()

        #* Permite que apenas o admin do django possa criar Gestores.
        if self.created_by and not self.pk:
            if not self.created_by.is_staff:
                raise ValidationError("Apenas os Admins do Django podem criar Gestores.")

