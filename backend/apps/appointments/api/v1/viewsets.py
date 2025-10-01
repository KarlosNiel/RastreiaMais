from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import AppointmentSerializer
from apps.appointments.models import Appointment

@extend_schema(tags=['Appointments'])
class AppointmentViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = Appointment.all_objects
    serializer_class = AppointmentSerializer
    