from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import secrets
import hashlib


def hash_token(raw: str) -> str:
    if not raw:
        return ""
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


class PasswordResetToken(models.Model):
    """
    Modelo para gerenciar tokens de recuperação de senha.
    Tokens expiram em 24 horas e são de uso único.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Token de Recuperação de Senha"
        verbose_name_plural = "Tokens de Recuperação de Senha"
        ordering = ['-created_at']

    def __str__(self):
        return f"Token para {self.user.email} - {'Usado' if self.used else 'Ativo'}"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @classmethod
    def create_for_user(cls, user):
        raw_token = secrets.token_urlsafe(32)
        hashed_token = hash_token(raw_token)
        instance = cls.objects.create(
            user=user,
            token=hashed_token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        return instance, raw_token

    @classmethod
    def find_token(cls, token_str: str):
        if not token_str:
            return None
        hashed = hash_token(token_str)
        return (
            cls.objects.select_related('user').filter(token=hashed).first()
            or cls.objects.select_related('user').filter(token=token_str).first()
        )

    def is_valid(self):
        """Verifica se o token ainda é válido"""
        return not self.used and timezone.now() < self.expires_at

    def mark_as_used(self):
        """Marca o token como usado"""
        self.used = True
        self.used_at = timezone.now()
        self.save()
