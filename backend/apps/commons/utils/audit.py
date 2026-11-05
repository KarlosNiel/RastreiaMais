import logging

lgpd_logger = logging.getLogger("lgpd")
audit_logger = logging.getLogger("audit")


def log_medical_access(user, action: str, patient_id: int, resource_name: str, request=None):
    """
    Registra auditoria de conformidade LGPD para acesso ou alteração
    de dados clínicos e prontuários de pacientes.
    """
    user_identifier = getattr(user, "username", "Anonymous")
    ip_addr = "unknown"
    if request:
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_addr = x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR", "unknown")

    message = (
        f"User='{user_identifier}' IP='{ip_addr}' Action='{action}' "
        f"Resource='{resource_name}' PatientID={patient_id}"
    )

    lgpd_logger.info(message)
    audit_logger.info(message)
