from django.core.cache import cache
from django.db.models.signals import post_save, post_delete


def get_kpis_cache_version() -> int:
    """Retorna a versão global atual do cache de KPIs."""
    version = cache.get("kpis_cache_version")
    if version is None:
        version = 1
        cache.set("kpis_cache_version", version, timeout=None)
    return version


def invalidate_dashboard_kpis_cache(*args, **kwargs):
    """
    Invalida instantaneamente em O(1) o cache de métricas de todos os usuários
    ao alterar um Agendamento, Alerta ou Paciente.
    """
    try:
        cache.incr("kpis_cache_version")
    except Exception:
        current = cache.get("kpis_cache_version", 1)
        cache.set("kpis_cache_version", current + 1, timeout=None)


def connect_kpi_signals():
    """Conecta os gatilhos de invalidação aos modelos que impactam o dashboard."""
    from apps.appointments.models import Appointment
    from apps.alerts.models import Alert
    from apps.accounts.models import PatientUser

    for model in [Appointment, Alert, PatientUser]:
        post_save.connect(invalidate_dashboard_kpis_cache, sender=model, weak=False)
        post_delete.connect(invalidate_dashboard_kpis_cache, sender=model, weak=False)
