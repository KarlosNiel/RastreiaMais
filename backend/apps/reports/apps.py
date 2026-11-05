from django.apps import AppConfig


class ReportsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reports'

    def ready(self):
        from .signals import connect_kpi_signals
        connect_kpi_signals()
