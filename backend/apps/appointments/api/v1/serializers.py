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

    def validate(self, attrs):
        professional = attrs.get("professional") or (self.instance.professional if self.instance else None)
        scheduled_datetime = attrs.get("scheduled_datetime") or (self.instance.scheduled_datetime if self.instance else None)
        status_val = attrs.get("status") or (self.instance.status if self.instance else "ativo")

        if professional and scheduled_datetime and status_val != "cancelado":
            conflict_qs = Appointment.objects.filter(
                professional=professional,
                scheduled_datetime=scheduled_datetime,
                is_deleted=False
            ).exclude(status="cancelado")

            if self.instance:
                conflict_qs = conflict_qs.exclude(pk=self.instance.pk)

            if conflict_qs.exists():
                raise serializers.ValidationError(
                    {"scheduled_datetime": "O profissional selecionado já possui um agendamento neste mesmo horário."}
                )

        return attrs

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
