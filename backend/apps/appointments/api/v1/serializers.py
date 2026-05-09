from rest_framework import serializers
from apps.commons.api.v1.serializers import BaseSerializer
from apps.accounts.models import PatientUser, ProfessionalUser
from apps.locations.models import Institution
from apps.appointments.models import Appointment
from apps.appointments.utils import calculate_risk_from_patient
from apps.accounts.api.v1.serializers import (
    PatientUserSerializer,
    ProfessionalUserSerializer,
)
from apps.locations.api.v1.serializers import InstitutionSerializer


class AppointmentSerializer(BaseSerializer):
    # Campos só de leitura (para resposta)
    professional = ProfessionalUserSerializer(read_only=True)
    patient = PatientUserSerializer(read_only=True)
    local = InstitutionSerializer(read_only=True)

    # Campos só de escrita (para criação/edição)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=PatientUser.objects.all(),
        source="patient",
        write_only=True,
        required=True,
    )
    professional_id = serializers.PrimaryKeyRelatedField(
        queryset=ProfessionalUser.objects.all(),
        source="professional",
        write_only=True,
        required=True,
    )
    local_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(),
        source="local",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = [
            "patient",
            "professional",
            "local",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

    def create(self, validated_data):
        """
        Ao criar um agendamento, calcula automaticamente o risk_level
        baseado nos dados clínicos do paciente se não foi definido
        explicitamente pelo frontend.
        """
        patient = validated_data.get("patient")

        if patient:
            calculated_risk = calculate_risk_from_patient(patient)

            # Usa o risco calculado pelo backend (mais confiável)
            validated_data["risk_level"] = calculated_risk

        return super().create(validated_data)
