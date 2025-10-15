from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import AppointmentSerializer
from apps.appointments.models import Appointment
from .permissions import AppoitmentsDataPermission
from apps.commons.api.v1.viewsets import BaseModelViewSet

@extend_schema(tags=['Appointments'])
class AppointmentViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, AppoitmentsDataPermission]

    queryset = Appointment.all_objects
    serializer_class = AppointmentSerializer
    