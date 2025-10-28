from django.contrib import admin
from .models import Appointment
from apps.commons.admin import BaseModelAdmin
from django.utils.html import format_html

# Register your models here.
@admin.register(Appointment)
class AppointmentAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'patient_display',
        'professional_display',
        'type',
        'colored_risk',
        'status',
        'scheduled_datetime',
        'created_by',
        'is_deleted',
    )
    list_filter = (
        'type',
        'risk_level',
        'status',
        'is_deleted',
        'scheduled_datetime',
    )
    search_fields = (
        'patient__user__first_name',
        'patient__user__last_name',
        'professional__user__first_name',
        'professional__user__last_name',
        'description',
    )
    date_hierarchy = 'scheduled_datetime'
    ordering = ('-scheduled_datetime',)

    def patient_display(self, obj):
        """Exibe o nome do paciente"""
        return obj.patient.user.get_full_name()
    patient_display.short_description = "Paciente"

    def professional_display(self, obj):
        """Exibe o nome do profissional"""
        return obj.professional.user.get_full_name()
    professional_display.short_description = "Profissional"

    def colored_risk(self, obj):
        """Mostra o risco com cor (igual ao admin de Alert)"""
        color_map = {
            'Seguro': 'green',
            'Moderado': 'orange',
            'Crítico': 'red'
        }
        color = color_map.get(obj.risk_level, 'gray')
        return format_html('<strong style="color:{};">{}</strong>', color, obj.risk_level)
    colored_risk.short_description = 'Risco'
