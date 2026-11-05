from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.alerts.models import Alert
from apps.commons.api.v1.viewsets import BaseModelViewSet
from .serializers import AlertSerializer
from .permissions import AlertDataPermission
from apps.accounts.utils.utils import get_user_profile

@extend_schema(tags=['Alerts'])
class AlertViewset(BaseModelViewSet):
    permission_classes = [IsAuthenticated, AlertDataPermission]
    queryset = Alert.objects
    serializer_class = AlertSerializer
    filterset_fields = ['patient', 'risk_level', 'status']
    search_fields = ['title', 'description', 'patient__cpf', 'patient__user__first_name', 'patient__user__last_name']
    ordering_fields = ['created_at', 'risk_level', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().select_related(
            'patient__user',
            'patient__address',
            'patient__has',
            'patient__dm',
            'resolved_by',
        ).prefetch_related(
            'patient__otherdcnt_set'
        )

        user = getattr(self.request, "user", None)
        if not user or not user.is_authenticated:
            return queryset.none()

        try:
            role, profile = get_user_profile(user)
        except Exception:
            role, profile = (None, None)

        if user.is_superuser or hasattr(user, "manageruser") or hasattr(user, "professionaluser"):
            pass
        elif hasattr(user, "patientuser"):
            queryset = queryset.filter(patient=getattr(user, "patientuser"))
        else:
            return queryset.none()

        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        return queryset

    @action(detail=True, methods=['patch', 'post'], url_path='resolve')
    def resolve_alert(self, request, pk=None):
        """Marca o alerta como resolvido pela equipe de saúde"""
        alert = self.get_object()
        notes = request.data.get('notes') or request.data.get('resolution_notes')
        alert.resolve(user=request.user, notes=notes)
        return Response({
            "detail": "Alerta resolvido com sucesso.",
            "status": alert.status,
            "resolved_at": alert.resolved_at
        }, status=status.HTTP_200_OK)