from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import HASSerializer, DMSerializer, OtherDCNTSerializer
from apps.conditions.models import HAS, DM, OtherDCNT

class HASViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = HAS.all_objects
    serializer_class = HASSerializer

class DMViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = DM.all_objects
    serializer_class = DMSerializer

class OtherDCNTViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated,]

    queryset = OtherDCNT.all_objects
    serializer_class = OtherDCNTSerializer
