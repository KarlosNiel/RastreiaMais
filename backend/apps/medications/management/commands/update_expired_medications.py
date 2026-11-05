import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.medications.models import Medication

logger = logging.getLogger("apps")


class Command(BaseCommand):
    help = "Atualiza automaticamente o status 'active' de medicações cujo prazo de término expirou."

    def handle(self, *args, **options):
        today = timezone.now().date()
        expired_qs = Medication.objects.filter(
            active=True,
            end_date__lt=today,
            is_deleted=False
        )
        count = expired_qs.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("Nenhuma medicação expirada para atualizar."))
            return

        updated = expired_qs.update(active=False)
        msg = f"{updated} medicação(ões) expirada(s) atualizada(s) para inativa(s) com sucesso."
        logger.info(msg)
        self.stdout.write(self.style.SUCCESS(msg))

