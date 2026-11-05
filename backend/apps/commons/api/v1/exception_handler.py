import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from apps.commons.middleware.correlation_id import get_current_request_id

logger = logging.getLogger("apps")


def custom_exception_handler(exc, context):
    """
    Exception handler customizado para a API.
    Preserva as respostas padrão do DRF (400, 401, 403, 404) e captura
    exceções não tratadas (500), garantindo resposta JSON em vez de página HTML.
    Anexa o X-Request-ID para correlação ponta a ponta com logs.
    """
    response = exception_handler(exc, context)
    request_id = get_current_request_id()

    if response is not None:
        if request_id:
            response["X-Request-ID"] = request_id
        return response

    # Exceção não tratada (Erro 500 interno)
    view = context.get("view")
    view_name = view.__class__.__name__ if view else "UnknownView"
    logger.exception("Exceção não tratada capturada em %s (request_id=%s): %s", view_name, request_id, exc)

    headers = {"X-Request-ID": request_id} if request_id else None
    return Response(
        {
            "detail": "Ocorreu um erro inesperado no servidor. Nossa equipe técnica foi notificada.",
            "code": "internal_server_error",
            "request_id": request_id or None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers=headers,
    )
