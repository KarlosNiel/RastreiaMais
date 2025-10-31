from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import AppointmentSerializer
from apps.appointments.models import Appointment
from .permissions import AppoitmentsDataPermission
from apps.commons.api.v1.viewsets import BaseModelViewSet
from apps.accounts.utils.utils import get_user_profile

@extend_schema(tags=['Appointments'])
class AppointmentViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, AppoitmentsDataPermission]

    queryset = Appointment.all_objects
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'patient':
            return queryset.filter(patient=profile)

        if role == 'professional':
            return queryset.filter(professional=profile)

        if role == 'manager' or role == 'superuser':
            return queryset

        return queryset.none()
            
    