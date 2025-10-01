from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import MedicationSerializer
from apps.medications.models import Medication

@extend_schema(tags=['Medications'])
class MedicationViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = Medication.all_objects
    serializer_class = MedicationSerializer