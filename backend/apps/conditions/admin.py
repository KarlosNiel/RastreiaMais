from django.contrib import admin
from .models import HAS, DM, OtherDCNT
from apps.commons.admin import BaseModelAdmin

class DCNTBaseAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'patient_display',
        'is_diagnosed',
        'uses_medication',
        'family_history',
        'is_deleted',
    )
    list_filter = (
        'is_diagnosed',
        'uses_medication',
        'family_history',
        'is_deleted',
    )
    search_fields = (
        'patient__user__first_name',
        'patient__user__last_name',
        'medications_name',
    )

    def patient_display(self, obj):
        """Mostra nome completo do paciente ou aviso se for None"""
        if obj.patient:
            return obj.patient.user.get_full_name()
        return "— Paciente removido —"
    patient_display.short_description = "Paciente"

@admin.register(HAS)
class HASAdmin(DCNTBaseAdmin):
    list_display = DCNTBaseAdmin.list_display + ('any_complications_HBP',)
    list_filter = DCNTBaseAdmin.list_filter + ('any_complications_HBP',)

@admin.register(DM)
class DMAdmin(DCNTBaseAdmin):
    list_display = DCNTBaseAdmin.list_display + (
        'treatment_type',
        'diabetes_comorbidities',
        'diabetic_foot',
    )
    list_filter = DCNTBaseAdmin.list_filter + (
        'treatment_type',
        'diabetes_comorbidities',
        'diabetic_foot',
    )

@admin.register(OtherDCNT)
class OtherDCNTAdmin(DCNTBaseAdmin):
    list_display = DCNTBaseAdmin.list_display + ('name',)
    search_fields = DCNTBaseAdmin.search_fields + ('name',)
