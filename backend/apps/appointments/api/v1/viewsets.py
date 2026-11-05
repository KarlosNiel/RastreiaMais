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
    filterset_fields = ['patient', 'professional', 'status', 'risk_level', 'local']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'patient__cpf', 'description']
    ordering_fields = ['scheduled_datetime', 'risk_level', 'created_at']
    ordering = ['scheduled_datetime']

    def get_queryset(self):
        queryset = super().get_queryset().select_related(
            'patient__user',
            'patient__address',
            'patient__has',
            'patient__dm',
            'professional__user',
            'local'
        ).prefetch_related(
            'patient__otherdcnt_set'
        )
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'patient':
            queryset = queryset.filter(patient=profile)
        elif role == 'professional':
            queryset = queryset.filter(professional=profile)
        elif role not in ('manager', 'superuser'):
            return queryset.none()

        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(scheduled_datetime__date=date)

        return queryset
            
    