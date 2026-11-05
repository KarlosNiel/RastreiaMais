from django.db import models
from django.utils import timezone
from datetime import timedelta


class AccountLockout(models.Model):
    """
    Rastreia tentativas de login falhas por usuário/CPF/identificador e IP,
    bloqueando ataques de força bruta corporativamente (Artigo 46 LGPD / ISO 27001).
    """
    identifier = models.CharField("Identificador", max_length=150, unique=True, db_index=True)
    ip_address = models.GenericIPAddressField("Último IP", null=True, blank=True)
    failed_attempts = models.PositiveIntegerField("Tentativas falhas", default=0)
    locked_until = models.DateTimeField("Bloqueado até", null=True, blank=True, db_index=True)
    last_attempt_at = models.DateTimeField("Última tentativa em", auto_now=True)

    class Meta:
        verbose_name = "Bloqueio de Conta"
        verbose_name_plural = "Bloqueios de Conta"

    def __str__(self):
        status = "BLOQUEADO" if self.is_locked() else f"{self.failed_attempts} falhas"
        return f"{self.identifier} ({status})"

    def is_locked(self) -> bool:
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def remaining_lockout_seconds(self) -> int:
        if self.is_locked():
            return int((self.locked_until - timezone.now()).total_seconds())
        return 0

    @classmethod
    def is_identifier_locked(cls, identifier: str) -> tuple[bool, int]:
        clean_id = (identifier or "").strip().lower()
        if not clean_id:
            return False, 0
        try:
            record = cls.objects.filter(identifier=clean_id).first()
            if record and record.is_locked():
                return True, record.remaining_lockout_seconds()
        except Exception:
            pass
        return False, 0

    @classmethod
    def record_failure(cls, identifier: str, ip: str = None, max_attempts: int = 5, lockout_minutes: int = 15):
        clean_id = (identifier or "").strip().lower()
        if not clean_id:
            return None

        record, _ = cls.objects.get_or_create(identifier=clean_id)
        if record.is_locked():
            return record

        record.failed_attempts += 1
        if ip:
            record.ip_address = ip
        if record.failed_attempts >= max_attempts:
            record.locked_until = timezone.now() + timedelta(minutes=lockout_minutes)
        record.save()
        return record

    @classmethod
    def reset_attempts(cls, identifier: str):
        clean_id = (identifier or "").strip().lower()
        if clean_id:
            cls.objects.filter(identifier=clean_id).update(failed_attempts=0, locked_until=None)
