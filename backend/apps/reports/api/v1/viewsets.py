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
