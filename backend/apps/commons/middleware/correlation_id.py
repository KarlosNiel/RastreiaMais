import uuid
import logging
from contextvars import ContextVar

# ContextVar para armazenamento thread-safe e async-safe do request_id atual
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")


def get_current_request_id() -> str:
    """Retorna o ID da requisição atual ou string vazia se fora de contexto HTTP."""
    return request_id_ctx.get()


class CorrelationIdMiddleware:
    """
    Middleware que extrai ou gera um identificador único de correlação (X-Request-ID)
    para cada requisição HTTP, facilitando rastreabilidade ponta a ponta e auditoria.
    """
    HEADER_NAME = "HTTP_X_REQUEST_ID"
    RESPONSE_HEADER = "X-Request-ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        req_id = request.META.get(self.HEADER_NAME)
        if not req_id or not req_id.strip():
            req_id = str(uuid.uuid4())
        else:
            req_id = req_id.strip()

        token = request_id_ctx.set(req_id)
        request.request_id = req_id

        try:
            response = self.get_response(request)
        finally:
            request_id_ctx.reset(token)

        response[self.RESPONSE_HEADER] = req_id
        return response


class CorrelationIdFilter(logging.Filter):
    """
    Filtro de logging que injeta o request_id no log record para formatters.
    """
    def filter(self, record):
        record.request_id = get_current_request_id() or "-"
        return True
