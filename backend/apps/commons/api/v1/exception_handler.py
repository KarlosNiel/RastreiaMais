import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger("apps")


def custom_exception_handler(exc, context):
    """
    Exception handler customizado para a API.
    Preserva as respostas padrão do DRF (400, 401, 403, 404) e captura
    exceções não tratadas (500), garantindo resposta JSON em vez de página HTML.
    """
    response = exception_handler(exc, context)

    if response is not None:
        return response

    # Exceção não tratada (Erro 500 interno)
    view = context.get("view")
    view_name = view.__class__.__name__ if view else "UnknownView"
    logger.exception("Exceção não tratada capturada em %s: %s", view_name, exc)

    return Response(
        {
            "detail": "Ocorreu um erro inesperado no servidor. Nossa equipe técnica foi notificada.",
            "code": "internal_server_error",
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
