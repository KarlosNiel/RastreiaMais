from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.alerts.models import Alert
from .serializers import AlertSerializer

@extend_schema(tags=['Alerts'])
class AlertViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = Alert.all_objects
    serializer_class = AlertSerializer