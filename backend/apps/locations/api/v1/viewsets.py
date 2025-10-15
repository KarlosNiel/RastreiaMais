from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated 
from .serializers import AddressSerializer, MicroAreaSerializer, InstitutionSerializer
from apps.locations.models import Address, MicroArea, Institution
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .permissions import LocationsDataPermissions


@extend_schema(tags=['Locations - Address'])
class AddressViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, LocationsDataPermissions]

    queryset = Address.all_objects
    serializer_class = AddressSerializer

@extend_schema(tags=['Locations - Micro-Area'])
class MicroAreaViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, LocationsDataPermissions]

    queryset = MicroArea.all_objects
    serializer_class = MicroAreaSerializer

@extend_schema(tags=['Locations - Institution'])
class InstitutionViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, LocationsDataPermissions]

    queryset = Institution.all_objects
    serializer_class = InstitutionSerializer
