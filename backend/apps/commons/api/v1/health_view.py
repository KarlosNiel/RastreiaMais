from django.db import connection
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse


class HealthCheckView(APIView):
    """
    Endpoint de verificação de integridade da API e banco de dados.
    Aberto para balanceadores de carga, Kubernetes e serviços de monitoramento.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Health Check",
        description="Verifica se a API e o banco de dados estão operacionais.",
        responses={
            200: OpenApiResponse(description="Serviço operacional"),
            503: OpenApiResponse(description="Serviço indisponível (banco inacessível)"),
        },
        tags=["Health"]
    )
    def get(self, request):
        db_healthy = True
        error_detail = None

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as e:
            db_healthy = False
            error_detail = str(e)

        data = {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "timestamp": timezone.now().isoformat(),
        }

        if not db_healthy:
            data["detail"] = error_detail
            return Response(data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(data, status=status.HTTP_200_OK)

