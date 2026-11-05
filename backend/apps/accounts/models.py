from django.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from apps.commons.models import BaseModel
from django.core.exceptions import ValidationError
from apps.accounts.utils.utils import get_creator_profile, SingleProfileMixin

from apps.accounts.data.patient import LifeStyle, SocialdemographicData, PsychosocialRisks, EnvironmentalRisks, PhysicalMotorRisks, ClassificationConducmMultiProfessional
from apps.accounts.models_password_reset import PasswordResetToken
from apps.accounts.models_security import AccountLockout

# Create your models here.

ROLE_CHOICES = [
    ("Médico", "Médico"),
    ("Odontologista", "Odontologista"),
    ("Enfermeiro", "Enfermeiro"),
    ("ACS", "ACS"),
    ("Psicólogo", "Psicólogo"),
    ("Médico Veterinário", "Médico Veterinário"),
    ("Fisioterapeuta", "Fisioterapeuta"),
    ("Assistente Social", "Assistente Social"),
    ("Nutricionista", "Nutricionista"),
]

#Patient=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class PatientUser(SingleProfileMixin, BaseModel, SocialdemographicData, LifeStyle, PsychosocialRisks,
                EnvironmentalRisks, PhysicalMotorRisks, ClassificationConducmMultiProfessional):
    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = 'Pacientes'
        indexes = [
            models.Index(fields=['cpf']),
            models.Index(fields=['sus']),
            models.Index(fields=['birth_date']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['cpf'],
                condition=Q(is_deleted=False) & Q(cpf__isnull=False) & ~Q(cpf=''),
                name='unique_active_patient_cpf'
            ),
            models.UniqueConstraint(
                fields=['sus'],
                condition=Q(is_deleted=False) & Q(sus__isnull=False) & ~Q(sus=''),
                name='unique_active_patient_sus'
            ),
        ]

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

    def delete(self, user=None):
        super().delete(user=user)
        # Cancela agendamentos futuros pendentes para evitar slots órfãos
        from apps.appointments.models import Appointment
        Appointment.objects.filter(
            patient=self,
            status='ativo',
            is_deleted=False
        ).update(status='cancelado')

#Professional=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class ProfessionalUser(SingleProfileMixin, BaseModel): 
    class Meta: 
        verbose_name = "Profissional"
        verbose_name_plural = "Profissionais"

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(choices=ROLE_CHOICES, max_length=100)
    professional_registry = models.CharField("Registro Profissional", max_length=50, null=True, blank=True)

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
class ManagerUser(SingleProfileMixin, BaseModel):
    class Meta:
        verbose_name = "Gestor"
        verbose_name_plural = "Gestores"

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

#PatientData=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

