from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import MedicationSerializer
from apps.medications.models import Medication
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .permissions import MedicationsDataPermission

@extend_schema(tags=['Medications'])
class MedicationViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, MedicationsDataPermission]

    queryset = Medication.all_objects
    serializer_class = MedicationSerializer