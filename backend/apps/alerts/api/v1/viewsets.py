from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.alerts.models import Alert
from .serializers import AlertSerializer


class AlertViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    queryset = Alert.all_objects
    serializer_class = AlertSerializer