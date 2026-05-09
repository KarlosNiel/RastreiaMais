from django.apps import AppConfig


class ConditionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.conditions'

    def ready(self):
        import apps.conditions.signals  # noqa: F401
