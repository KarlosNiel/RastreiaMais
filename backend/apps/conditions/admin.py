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
        'created_at',
        'created_by',
    )
    list_filter = (
        'is_diagnosed',
        'uses_medication',
        'family_history',
        'is_deleted',
        'created_at',
        'updated_at',
    )
    search_fields = (
        'patient__user__first_name',
        'patient__user__last_name',
        'medications_name',
    )

    readonly_fields = BaseModelAdmin.readonly_fields

    def patient_display(self, obj):
        """Mostra nome completo do paciente ou aviso se for None"""
        if obj.patient:
            return obj.patient.user.get_full_name()
        return "— Paciente removido —"
    patient_display.short_description = "Paciente"


# === HAS ===
@admin.register(HAS)
class HASAdmin(DCNTBaseAdmin):
    list_display = DCNTBaseAdmin.list_display + ('any_complications_HBP',)
    list_filter = DCNTBaseAdmin.list_filter + ('any_complications_HBP',)

    fieldsets = (
        ("Informações do Paciente", {"fields": ("patient",)}),
        ("Informações Básicas", {
            "fields": ("is_diagnosed", "uses_medication", "medications_name", "family_history"),
        }),
        ("Avaliação Clínica", {
            "fields": (
                "BP_assessment1_1", "BP_assessment1_2",
                "BP_assessment2_1", "BP_assessment2_2",
                "weight", "IMC", "abdominal_circumference",
                "total_cholesterol", "cholesterol_data",
                "HDL_cholesterol", "HDL_data",
            ),
        }),
        ("Classificação e Conduta", {
            "fields": ("BP_classifications", "framingham_score", "conduct_adopted"),
        }),
        ("Complicações", {
            "fields": ("any_complications_HBP",),
        }),
        ("Auditoria", {
            "fields": (
                "created_at", "created_by",
                "updated_at", "updated_by",
                "deleted_at", "deleted_by",
            ),
        }),
    )


# === DM ===
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

    fieldsets = (
        ("Informações do Paciente", {"fields": ("patient",)}),
        ("Informações Básicas", {
            "fields": ("is_diagnosed", "uses_medication", "medications_name", "family_history"),
        }),
        ("Avaliação Clínica", {
            "fields": (
                "capillary_blood_glucose_random",
                "fasting_capillary_blood_glucose",
                "glycated_hemoglobin",
                "weight", "height", "IMC",
                "abdominal_circumference",
            ),
        }),
        ("Fatores de Risco", {
            "fields": (
                "age_over_45",
                "overweight_or_obesity_imc_25",
                "physical_inactivity",
                "high_blood_pressure",
                "high_cholesterol_or_triglycerides",
                "history_of_gestational_diabetes",
                "polycystic_ovary_syndrome",
            ),
        }),
        ("Classificação e Conduta", {
            "fields": ("screening_result", "adopted_conduct", "adopted_conduct_other"),
        }),
        ("Tratamento e Comorbidades", {
            "fields": (
                "treatment_type", "treatment_type_other",
                "diabetes_comorbidities", "diabetes_comorbidities_others",
                "diabetic_foot", "diabetic_foot_member",
            ),
        }),
        ("Auditoria", {
            "fields": (
                "created_at", "created_by",
                "updated_at", "updated_by",
                "deleted_at", "deleted_by",
            ),
        }),
    )


# === OUTRAS DCNT ===
@admin.register(OtherDCNT)
class OtherDCNTAdmin(DCNTBaseAdmin):
    list_display = DCNTBaseAdmin.list_display + ('name',)
    search_fields = DCNTBaseAdmin.search_fields + ('name',)

    fieldsets = (
        ("Informações do Paciente", {"fields": ("patient",)}),
        ("Informações Básicas", {
            "fields": ("is_diagnosed", "uses_medication", "medications_name", "family_history"),
        }),
        ("Outras DCNT", {
            "fields": ("name",),
        }),
        ("Auditoria", {
            "fields": (
                "created_at", "created_by",
                "updated_at", "updated_by",
                "deleted_at", "deleted_by",
            ),
        }),
    )