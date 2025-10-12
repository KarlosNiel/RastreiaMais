from django.contrib import admin
from .models import Medication
from apps.commons.admin import BaseModelAdmin
from django.utils.html import format_html
# Register your models here.

@admin.register(Medication)
class MedicationAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'patient_display',
        'name',
        'active_display',
        'end_date',
        'is_deleted',
        'created_by',
        'created_at',
    )
    list_filter = (
        'active',
        'is_deleted',
        'end_date',
    )
    search_fields = (
        'patient__user__first_name',
        'patient__user__last_name',
        'name',
        'description',
    )
    ordering = ('-created_at',)


    def patient_display(self, obj):
        """Mostra nome completo do paciente"""
        if obj.patient:
            return obj.patient.user.get_full_name()
        return "— Paciente removido —"
    patient_display.short_description = "Paciente"

    def active_display(self, obj):
        """Mostra se a medicação está ativa ou não com cor"""
        active = obj.is_active()
        color = 'green' if active else 'red'
        status = 'Ativa' if active else 'Finalizada'
        return format_html('<strong style="color:{};">{}</strong>', color, status)
    active_display.short_description = 'Status'
