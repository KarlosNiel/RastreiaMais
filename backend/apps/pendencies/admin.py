from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Pendency
from apps.commons.admin import BaseModelAdmin

@admin.register(Pendency)
class PendencyAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'patient_display',
        'micro_area_display',
        'is_deleted',
        'created_by',
        'created_at',
    )
    list_filter = (
        'micro_area',
        'is_deleted',
    )
    search_fields = (
        'patient__user__first_name',
        'patient__user__last_name',
        'micro_area__name',
    )
    ordering = ('-created_at',)

    # =====================================================
    # CUSTOMIZADORES DE EXIBIÇÃO
    # =====================================================
    def patient_display(self, obj):
        """Exibe o nome completo do paciente"""
        if obj.patient:
            return obj.patient.user.get_full_name()
        return "— Paciente removido —"
    patient_display.short_description = "Paciente"

    def micro_area_display(self, obj):
        """Exibe o nome da microárea ou aviso se None"""
        if obj.micro_area:
            return obj.micro_area.name
        return "— Sem microárea —"
    micro_area_display.short_description = "Microárea"
