import logging

lgpd_logger = logging.getLogger("lgpd")
audit_logger = logging.getLogger("audit")


def get_client_ip(request):
    """Extrai IP do cliente considerando proxies reversos (Cloudflare/Render)."""
    if not request:
        return None
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_medical_access(user, action: str, patient_id: int, resource_name: str, request=None):
    """
    Registra auditoria de conformidade LGPD para acesso ou alteração
    de dados clínicos e prontuários de pacientes.
    """
    user_identifier = getattr(user, "username", "Anonymous")
    ip_addr = get_client_ip(request) or "unknown"

    message = (
        f"User='{user_identifier}' IP='{ip_addr}' Action='{action}' "
        f"Resource='{resource_name}' PatientID={patient_id}"
    )

    lgpd_logger.info(message)
    audit_logger.info(message)


def log_security_event(event_type: str, identifier: str, details: str = "", request=None):
    """Registra eventos críticos de segurança da informação (ex.: brute force, lockout)."""
    ip_addr = get_client_ip(request) or "unknown"
    message = f"SecurityEvent='{event_type}' Identifier='{identifier}' IP='{ip_addr}' Details='{details}'"
    audit_logger.warning(message)
