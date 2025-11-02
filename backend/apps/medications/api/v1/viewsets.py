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

    def get_queryset(self):
        queryset = super().get_queryset()
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'patient':
            return queryset.filter(patient=profile)

        if role == 'professional' or role == 'manager' or role == 'superuser':
            return queryset

        return queryset.none()   