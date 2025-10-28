from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import PatientUser, ProfessionalUser, ManagerUser
from apps.commons.admin import BaseModelAdmin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

admin.site.unregister(User)

@admin.register(User)
class UserAdmin(BaseUserAdmin):  
    #* Mostra campos extras no formulário de criação
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'email', 'password1', 'password2'),
        }),
    )
    
    #* Mostra campos extras no formulário de edição
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informações pessoais', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas importantes', {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('username', 'first_name', 'last_name', 'email', 'is_staff')

@admin.register(PatientUser)
class PatientUserAdmin(BaseModelAdmin):
    list_display = ('id', 'get_full_name',)
    list_filter = ('is_deleted',)

    fieldsets = (
        ("Auditoria", {
            "fields": ("is_deleted", "created_at", "updated_at", "deleted_at", "created_by", "updated_by", "deleted_by")
        }),
        ("Vinculo", {
            "fields": ("user",)
        }),
        ("Dados Sociodemográficos", {
            "fields": (
                "cpf",
                "birth_date",
                "gender",
                "age",
                "race_ethnicity",
                "scholarity",
                "occupation",
                "civil_status",
                "people_per_household",
                "family_responsability",
                "family_income",
                "bolsa_familia",
                "micro_area",
                "address",
                "phone",
                "whatsapp",
                )
            }
        ),
        ("Estilo de Vida", {
            "fields": (
                "feed", 
                "salt_consumption", 
                "alcohol_consumption", 
                "smoking", 
                "last_consultation"
                )
            }
        ),
        ("Riscos Psicossociais", {
            "fields": (
                "use_psychotropic_medication",
                "use_psychotropic_medication_answer",
                "any_psychological_psychiatric_diagnosis",
                "any_psychological_psychiatric_diagnosis_answer",
                "everyday_stress_interfere_with_your_BP_BS_control",
                "economic_factors_interfere_with_your_treatment",
                "feel_receive_support_from_family_friends_to_maintain_treatment",
                "regularly_follow_health_guidelines",
                )
            }
        ),
        ("Riscos Ambientais", {
            "fields": (
                "delayed_wound_healing_after_scratches_or_bites",
                "presence_of_pets_at_home",
                "presence_of_pets_at_home_answer",
                "your_animals_are_vaccinated",
                "diagnosed_transmissible_disease_in_household",
                "direct_contact_with_animal_bodily_fluids",
                "received_guidance_on_zoonoses",
                )
            }
        ),
        ("Riscos Físico-Motores", {
            "fields": (
                "performs_physical_activity",
                "performs_physical_activity_answer",
                "has_edema",
                "has_dyspnea",
                "has_paresthesia_or_cramps",
                "has_difficulty_walking_or_activity",
                )
            }
        ),
        ("Encaminhamento Multiprofissional", {
            "fields": (
                "requires_multidisciplinary_referral",
                "requires_multidisciplinary_referral_choose",
                )
            }
        ),
    )
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome completo'

# =============================================================================
@admin.register(ProfessionalUser)
class ProfessionalUserAdmin(BaseModelAdmin):
    list_display = ('id', 'get_full_name', 'role',)
    list_filter = ('role', 'is_deleted')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome completo'


# =============================================================================
@admin.register(ManagerUser)
class ManagerUserAdmin(BaseModelAdmin):
    list_display = ('id', 'get_full_name', 'phone', 'created_by', 'is_deleted', 'created_at')
    list_filter = ('is_deleted',)

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome completo'
