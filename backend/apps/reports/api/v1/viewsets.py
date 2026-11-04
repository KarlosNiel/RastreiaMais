from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.reports.soap_service import generate_soap_report
from .soap_serializer import SOAPGenerateRequestSerializer, SOAPReportResponseSerializer


@extend_schema(tags=['Reports - SOAP'])
class SOAPReportViewSet(ViewSet):
    """
    ViewSet para geração de relatório SOAP (Subjetivo, Objetivo, Avaliação, Plano).
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=SOAPGenerateRequestSerializer,
        responses={200: SOAPReportResponseSerializer},
        summary="Gerar relatório SOAP",
        description="Gera um relatório SOAP completo para o paciente informado.",
    )
    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        """POST /api/v1/reports/soap/generate/"""
        serializer = SOAPGenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient_id = serializer.validated_data["patient_id"]

        try:
            report = generate_soap_report(patient_id)
        except Exception as e:
            return Response(
                {"detail": f"Erro ao gerar relatório: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = SOAPReportResponseSerializer(report)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=['Reports - KPIs'])
class DashboardKPIsViewSet(ViewSet):
    """
    ViewSet para métricas agregadas ultra-rápidas para Gestor e Profissional.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Obter KPIs do Dashboard",
        description="Retorna contadores otimizados (SQL COUNT) para gestores e profissionais.",
    )
    def list(self, request):
        from apps.accounts.utils.utils import get_user_profile
        from apps.accounts.models import PatientUser
        from apps.appointments.models import Appointment
        from apps.alerts.models import Alert

        role, profile = get_user_profile(request.user)

        patients_qs = PatientUser.objects.filter(is_deleted=False)
        appointments_qs = Appointment.objects.filter(is_deleted=False)
        alerts_qs = Alert.objects.filter(is_deleted=False)

        if role == 'patient' and profile:
            appointments_qs = appointments_qs.filter(patient=profile)
            alerts_qs = alerts_qs.filter(patient=profile)

        total_patients = patients_qs.count()
        total_appointments = appointments_qs.count()
        critical_appointments = appointments_qs.filter(risk_level="Crítico").count()
        critical_alerts = alerts_qs.filter(risk_level="critical").count()

        return Response({
            "total_patients": total_patients,
            "total_appointments": total_appointments,
            "critical_appointments": critical_appointments,
            "critical_alerts": critical_alerts,
        }, status=status.HTTP_200_OK)
