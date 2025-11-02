from rest_framework import serializers
from apps.appointments.models import *
from apps.accounts.api.v1.serializers import ProfessionalUserSerializer
from apps.locations.api.v1.serializers import InstitutionSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    professional = ProfessionalUserSerializer(read_only=True)
    local = InstitutionSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields ='__all__'
        