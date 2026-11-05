from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.accounts.models import PatientUser
from apps.accounts.utils.utils import get_user_profile
from apps.commons.utils.audit import log_medical_access
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
        role, profile = get_user_profile(request.user)

        if role == 'patient' and (not profile or profile.id != patient_id):
            return Response(
                {"detail": "Você não tem permissão para acessar o prontuário deste paciente."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if role not in ('patient', 'professional', 'manager', 'superuser'):
            return Response(
                {"detail": "Você não possui perfil com permissão para acessar este recurso."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            report = generate_soap_report(patient_id)
            log_medical_access(request.user, "GENERATE_SOAP_REPORT", patient_id, "SOAPReport", request=request)
        except PatientUser.DoesNotExist:
            return Response(
                {"detail": "Paciente não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": f"Erro ao gerar relatório: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = SOAPReportResponseSerializer(report)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Exportar Relatório SOAP em HTML para Impressão",
        description="Retorna documento HTML estilizado pronto para impressão médica ou PDF.",
        tags=['Reports - SOAP']
    )
    @action(detail=False, methods=["get"], url_path="export-html")
    def export_html(self, request):
        """GET /api/v1/reports/soap/export-html/?patient_id=123"""
        from django.http import HttpResponse
        from apps.reports.soap_export import render_soap_html

        patient_id_raw = request.query_params.get("patient_id")
        if not patient_id_raw:
            return Response(
                {"detail": "Parâmetro 'patient_id' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            patient_id = int(patient_id_raw)
        except ValueError:
            return Response(
                {"detail": "Parâmetro 'patient_id' inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        role, profile = get_user_profile(request.user)

        if role == 'patient' and (not profile or profile.id != patient_id):
            return Response(
                {"detail": "Você não tem permissão para acessar o prontuário deste paciente."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if role not in ('patient', 'professional', 'manager', 'superuser'):
            return Response(
                {"detail": "Você não possui perfil com permissão para acessar este recurso."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            report = generate_soap_report(patient_id)
            log_medical_access(request.user, "EXPORT_SOAP_HTML", patient_id, "SOAPReport", request=request)
        except PatientUser.DoesNotExist:
            return Response(
                {"detail": "Paciente não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": f"Erro ao gerar relatório: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        prof_name = request.user.get_full_name() or request.user.username
        html = render_soap_html(report, professional_name=prof_name)
        return HttpResponse(html, content_type="text/html; charset=utf-8")


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
        from django.core.cache import cache
        from apps.accounts.utils.utils import get_user_profile
        from apps.accounts.models import PatientUser
        from apps.appointments.models import Appointment
        from apps.alerts.models import Alert
        from apps.reports.signals import get_kpis_cache_version

        role, profile = get_user_profile(request.user)
        version = get_kpis_cache_version()
        profile_key = getattr(profile, "id", "global")
        cache_key = f"dashboard_kpis_v{version}_{role}_{profile_key}"

        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        patients_qs = PatientUser.objects.filter(is_deleted=False)
        appointments_qs = Appointment.objects.filter(is_deleted=False)
        alerts_qs = Alert.objects.filter(is_deleted=False)

        if role == 'patient' and profile:
            appointments_qs = appointments_qs.filter(patient=profile)
            alerts_qs = alerts_qs.filter(patient=profile)
            total_patients = 1
        elif role == 'professional' and profile:
            appointments_qs = appointments_qs.filter(professional=profile)
            total_patients = appointments_qs.values('patient').distinct().count()
            # Alertas relevantes aos pacientes atendidos pelo profissional
            patient_ids = appointments_qs.values_list('patient_id', flat=True).distinct()
            if patient_ids:
                alerts_qs = alerts_qs.filter(patient_id__in=patient_ids)
            else:
                alerts_qs = alerts_qs.none()
        else:
            total_patients = patients_qs.count()

        total_appointments = appointments_qs.count()
        critical_appointments = appointments_qs.filter(risk_level="Crítico").count()
        critical_alerts = alerts_qs.filter(risk_level="critical", status="pending").count()

        data = {
            "total_patients": total_patients,
            "total_appointments": total_appointments,
            "critical_appointments": critical_appointments,
            "critical_alerts": critical_alerts,
        }
        cache.set(cache_key, data, timeout=300)

        return Response(data, status=status.HTTP_200_OK)
