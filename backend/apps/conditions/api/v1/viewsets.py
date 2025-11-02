from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import HASSerializer, DMSerializer, OtherDCNTSerializer
from apps.conditions.models import HAS, DM, OtherDCNT
from .permissions import ConditionsDataPermission
from apps.commons.api.v1.viewsets import BaseModelViewSet

@extend_schema(tags=['Conditions - HAS'])
class HASViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ConditionsDataPermission]
    queryset = HAS.all_objects
    serializer_class = HASSerializer

@extend_schema(tags=['Conditions - DM'])
class DMViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ConditionsDataPermission]

    queryset = DM.all_objects
    serializer_class = DMSerializer

@extend_schema(tags=['Conditions - Other'])
class OtherDCNTViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, ConditionsDataPermission]

    queryset = OtherDCNT.all_objects
    serializer_class = OtherDCNTSerializer
