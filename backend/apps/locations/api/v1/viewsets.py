from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated 
from .serializers import AddressSerializer, MicroAreaSerializer, InstitutionSerializer
from apps.locations.models import Address, MicroArea, Institution

@extend_schema(tags=['Locations - Address'])
class AddressViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = Address.all_objects
    serializer_class = AddressSerializer

@extend_schema(tags=['Locations - Micro-Area'])
class MicroAreaViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = MicroArea.all_objects
    serializer_class = MicroAreaSerializer

@extend_schema(tags=['Locations - Institution'])
class InstitutionViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = Institution.all_objects
    serializer_class = InstitutionSerializer
