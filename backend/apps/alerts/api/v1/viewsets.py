from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.alerts.models import Alert
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .serializers import AlertSerializer
from .permissions import AlertDataPermission

@extend_schema(tags=['Alerts'])
class AlertViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, AlertDataPermission]
    queryset = Alert.all_objects
    serializer_class = AlertSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role, profile = get_user_profile(self.request.user)

        if not self.request.user.is_authenticated:
            return queryset.none()

        if role == 'professional':
            return queryset.filter(professional=profile)

        if role in ['manager', 'superuser']:
            return queryset

        return queryset.none()   