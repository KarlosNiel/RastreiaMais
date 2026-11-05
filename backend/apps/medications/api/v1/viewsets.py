from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import MedicationSerializer
from apps.medications.models import Medication
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .permissions import MedicationsDataPermission
from apps.accounts.utils.utils import get_user_profile

@extend_schema(tags=['Medications'])
class MedicationViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, MedicationsDataPermission]
    queryset = Medication.all_objects
    serializer_class = MedicationSerializer
    filterset_fields = ['patient', 'active']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'end_date', 'active']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().select_related('patient__user')
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'patient':
            queryset = queryset.filter(patient=profile)
        elif role not in ('professional', 'manager', 'superuser'):
            return queryset.none()

        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        return queryset   