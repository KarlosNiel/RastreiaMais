from rest_framework import serializers
from apps.appointments.models import *

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields ='__all__'
        