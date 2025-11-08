from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.alerts.models import Alert
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .serializers import AlertSerializer
from .permissions import AlertDataPermission
from apps.accounts.utils.utils import get_user_profile

@extend_schema(tags=['Alerts'])
class AlertViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, AlertDataPermission]
    queryset = Alert.all_objects
    serializer_class = AlertSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        user = getattr(self.request, "user", None)
        if not user or not user.is_authenticated:
            return queryset.none()

        try:
            role, profile = get_user_profile(user)
        except Exception:
            role, profile = (None, None)

        if user.is_superuser or hasattr(user, "manageruser"):
            return queryset

        if hasattr(user, "professionaluser"):
            return queryset.filter(professional=getattr(user, "professionaluser"))

        if hasattr(user, "patientuser"):
            return queryset.filter(patient=getattr(user, "patientuser"))

        return queryset.none()