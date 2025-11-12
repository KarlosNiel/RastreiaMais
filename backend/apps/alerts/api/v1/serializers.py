from rest_framework import serializers
from apps.alerts.models import Alert
from apps.accounts.models import PatientUser
from apps.accounts.api.v1.serializers import PatientUserSerializer

class AlertSerializer(serializers.ModelSerializer):
    patient = PatientUserSerializer(read_only=True)
    cpf = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "cpf",
            "patient",
            "risk_level",
            "title",
            "description",
            "created_at",
            "created_by",
            "deleted_by",
            "deleted_at",
            "is_deleted"
        ]
        read_only_fields = ["patient", "created_at", "created_by", "deleted_by", "deleted_at", "is_deleted"]

    def create(self, validated_data):
        cpf = validated_data.pop("cpf")
        try:
            patient = PatientUser.objects.get(cpf=cpf)
        except PatientUser.DoesNotExist:
            raise serializers.ValidationError({"cpf": "Paciente não encontrado."})

        alert = Alert.objects.create(patient=patient, **validated_data)
        return alert
