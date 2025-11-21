from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import secrets


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

    def is_valid(self):
        """Verifica se o token ainda é válido"""
        return not self.used and timezone.now() < self.expires_at

    def mark_as_used(self):
        """Marca o token como usado"""
        self.used = True
        self.used_at = timezone.now()
        self.save()
