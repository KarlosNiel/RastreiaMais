from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import json
from django.forms.models import model_to_dict

# Create your models here.

#QuerySet=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class SoftDeleteQuerySet(models.QuerySet): #* Custom QuerySet para implementar soft_delete.
    def delete(self):
        return super().update(is_deleted=True, deleted_at=now())
    
    def restore(self):
        return super().update(is_deleted=False, deleted_at=None )
    
    def hard_delete(self): #! Cuidado! deleta permanentemente o objeto.
        return super().delete()

    def active(self):
        return self.filter(is_deleted=False)
    
    def deleted(self):
        return self.filter(is_deleted=True)
    
#Manager=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class ActiveManager(models.Manager): #* Inclui apenas os objetos que não foram soft_deleted.
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)
    
class AllManager(models.Manager): #* Inclui todos os objetos, mesmo os com soft_delete, mas cuidado com o hard_delete!
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db)

#Audit Models=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class AuditLog(models.Model):
    """
    Modelo para registrar todas as ações realizadas no sistema.
    Essencial para compliance com LGPD e rastreabilidade.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Criação'),
        ('UPDATE', 'Atualização'),
        ('DELETE', 'Exclusão'),
        ('RESTORE', 'Restauração'),
        ('VIEW', 'Visualização'),
        ('EXPORT', 'Exportação'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('ACCESS_DENIED', 'Acesso Negado'),
    ]
    
    SENSITIVITY_CHOICES = [
        ('LOW', 'Baixa'),
        ('MEDIUM', 'Média'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ]
    
    # Informações básicas da ação
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Usuário")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name="Ação")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora")
    
    # Informações do objeto afetado
    content_type = models.CharField(max_length=100, verbose_name="Tipo de Objeto")
    object_id = models.CharField(max_length=100, null=True, blank=True, verbose_name="ID do Objeto")
    object_repr = models.CharField(max_length=200, null=True, blank=True, verbose_name="Representação do Objeto")
    
    # Dados da mudança
    changes = models.JSONField(null=True, blank=True, verbose_name="Mudanças")
    old_values = models.JSONField(null=True, blank=True, verbose_name="Valores Anteriores")
    new_values = models.JSONField(null=True, blank=True, verbose_name="Novos Valores")
    
    # Informações técnicas
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Endereço IP")
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")
    session_key = models.CharField(max_length=40, null=True, blank=True, verbose_name="Chave da Sessão")
    
    # Classificação de sensibilidade (LGPD)
    sensitivity_level = models.CharField(
        max_length=10, 
        choices=SENSITIVITY_CHOICES, 
        default='MEDIUM',
        verbose_name="Nível de Sensibilidade"
    )
    
    # Informações adicionais
    description = models.TextField(null=True, blank=True, verbose_name="Descrição")
    additional_data = models.JSONField(null=True, blank=True, verbose_name="Dados Adicionais")
    
    class Meta:
        verbose_name = "Log de Auditoria"
        verbose_name_plural = "Logs de Auditoria"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['sensitivity_level']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.get_action_display()} - {self.timestamp.strftime('%d/%m/%Y %H:%M:%S')}"

class DataAccessLog(models.Model):
    """
    Modelo específico para registrar acessos a dados pessoais.
    Compliance com LGPD - Art. 37.
    """
    ACCESS_TYPE_CHOICES = [
        ('VIEW', 'Visualização'),
        ('DOWNLOAD', 'Download'),
        ('EXPORT', 'Exportação'),
        ('PRINT', 'Impressão'),
        ('SEARCH', 'Busca'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Usuário")
    patient = models.ForeignKey('accounts.PatientUser', on_delete=models.CASCADE, verbose_name="Paciente")
    access_type = models.CharField(max_length=20, choices=ACCESS_TYPE_CHOICES, verbose_name="Tipo de Acesso")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora")
    
    # Informações técnicas
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Endereço IP")
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")
    
    # Dados acessados
    data_fields = models.JSONField(null=True, blank=True, verbose_name="Campos Acessados")
    purpose = models.TextField(verbose_name="Finalidade do Acesso")
    
    # Informações legais
    legal_basis = models.CharField(max_length=200, verbose_name="Base Legal")
    retention_period = models.CharField(max_length=100, null=True, blank=True, verbose_name="Período de Retenção")
    
    class Meta:
        verbose_name = "Log de Acesso a Dados"
        verbose_name_plural = "Logs de Acesso a Dados"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['patient', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['access_type']),
        ]
    
    def __str__(self):
        return f"{self.user} acessou dados de {self.patient} - {self.timestamp.strftime('%d/%m/%Y %H:%M:%S')}"

class ConsentLog(models.Model):
    """
    Modelo para registrar consentimentos dos titulares de dados.
    Compliance com LGPD - Art. 8º.
    """
    CONSENT_TYPE_CHOICES = [
        ('DATA_PROCESSING', 'Processamento de Dados'),
        ('DATA_SHARING', 'Compartilhamento de Dados'),
        ('MARKETING', 'Marketing'),
        ('RESEARCH', 'Pesquisa'),
        ('TREATMENT', 'Tratamento Médico'),
    ]
    
    STATUS_CHOICES = [
        ('GRANTED', 'Concedido'),
        ('REVOKED', 'Revogado'),
        ('EXPIRED', 'Expirado'),
    ]
    
    patient = models.ForeignKey('accounts.PatientUser', on_delete=models.CASCADE, verbose_name="Paciente")
    consent_type = models.CharField(max_length=50, choices=CONSENT_TYPE_CHOICES, verbose_name="Tipo de Consentimento")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='GRANTED', verbose_name="Status")
    
    # Datas importantes
    granted_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Concessão")
    revoked_at = models.DateTimeField(null=True, blank=True, verbose_name="Data de Revogação")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Data de Expiração")
    
    # Detalhes do consentimento
    purpose = models.TextField(verbose_name="Finalidade")
    data_categories = models.JSONField(verbose_name="Categorias de Dados")
    legal_basis = models.CharField(max_length=200, verbose_name="Base Legal")
    
    # Informações técnicas
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Endereço IP")
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")
    
    # Evidências
    consent_text = models.TextField(verbose_name="Texto do Consentimento")
    evidence_file = models.FileField(upload_to='consent_evidence/', null=True, blank=True, verbose_name="Arquivo de Evidência")
    
    class Meta:
        verbose_name = "Log de Consentimento"
        verbose_name_plural = "Logs de Consentimento"
        ordering = ['-granted_at']
        indexes = [
            models.Index(fields=['patient', 'consent_type']),
            models.Index(fields=['status']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.patient} - {self.get_consent_type_display()} - {self.get_status_display()}"
    
    def is_valid(self):
        """Verifica se o consentimento ainda é válido"""
        if self.status == 'REVOKED':
            return False
        if self.expires_at and now() > self.expires_at:
            return False
        return True

#BaseModel=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, related_name='%(class)s_created', on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey(User, related_name='%(class)s_updated', on_delete=models.SET_NULL, null=True, blank=True)
    deleted_by = models.ForeignKey(User, related_name='%(class)s_deleted', on_delete=models.SET_NULL, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Managers
    objects = ActiveManager()
    all_objects = AllManager()

    class Meta:
        abstract = True
        ordering = ['-created_at'] #* Ordenando pelo criado mais recentemente.
        get_latest_by = 'created_at' #* Permite pegar o Primeiro ou ultimo (ex: <model>.objects.latest() ou earliest)

    def clean(self):
        super().clean()

        if self.is_deleted and not self.deleted_at:
            raise ValidationError("Se is_deleted=True, deleted_at deve estar preenchido")
        
        if not self.is_deleted and self.deleted_at: #* se is deleted for false e deleted_at estiver preenchido, self.deleted_at vira null
            self.deleted_at = None
            self.deleted_by = None

    def save(self, *args, user=None, **kwargs):
        # Captura valores antigos para auditoria
        old_values = None
        if self.pk:
            try:
                old_instance = self.__class__.objects.get(pk=self.pk)
                old_values = model_to_dict(old_instance)
            except self.__class__.DoesNotExist:
                pass
        
        # Se for criação e não tiver created_by, define
        if not self.pk and not self.created_by:
            self.created_by = user

        # Sempre atualiza updated_by
        if user:
            self.updated_by = user

        super().save(*args, **kwargs)
        
        # Registra auditoria
        self._log_audit_action(
            action='CREATE' if not old_values else 'UPDATE',
            user=user,
            old_values=old_values,
            new_values=model_to_dict(self)
        )
    
    def delete(self, user=None):
        # Captura valores antes da exclusão
        old_values = model_to_dict(self)
        
        self.is_deleted = True
        self.deleted_at = now()

        if user:
            self.deleted_by = user

        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
        
        # Registra auditoria
        self._log_audit_action(
            action='DELETE',
            user=user,
            old_values=old_values
        )

    def restore(self, user=None):
        # Captura valores antes da restauração
        old_values = model_to_dict(self)
        
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None

        if user:
            self.updated_by = user

        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'updated_by'])
        
        # Registra auditoria
        self._log_audit_action(
            action='RESTORE',
            user=user,
            old_values=old_values,
            new_values=model_to_dict(self)
        )

    def hard_delete(self, keep_parents=False): #* Esse keep_parents serve pra dizer se os objetos pais do objeto deletado devem ser deletados também
        super().delete(keep_parents=keep_parents)
    
    def get_creator_profile(self, user):
        """Retorna o tipo de user que criou o objeto"""
        if not user:
            return None
        
        from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
        
        for model in [PatientUser, ProfessionalUser, ManagerUser]:
            try:
                return model.objects.get(user=user)
            except model.DoesNotExist:
                continue 
        return None
    
    def _log_audit_action(self, action, user=None, old_values=None, new_values=None):
        """Registra ação de auditoria"""
        try:
            # Determina nível de sensibilidade baseado no modelo
            sensitivity_level = self._get_sensitivity_level()
            
            # Calcula mudanças
            changes = {}
            if old_values and new_values:
                for key, new_value in new_values.items():
                    old_value = old_values.get(key)
                    if old_value != new_value:
                        changes[key] = {
                            'old': old_value,
                            'new': new_value
                        }
            
            AuditLog.objects.create(
                user=user,
                action=action,
                content_type=self.__class__.__name__,
                object_id=str(self.pk) if self.pk else None,
                object_repr=str(self),
                changes=changes if changes else None,
                old_values=old_values,
                new_values=new_values,
                sensitivity_level=sensitivity_level,
                description=f"{action} em {self.__class__.__name__}: {str(self)}"
            )
        except Exception as e:
            # Log de erro, mas não interrompe a operação principal
            import logging
            logger = logging.getLogger('apps.commons')
            logger.error(f"Erro ao registrar auditoria: {e}")
    
    def _get_sensitivity_level(self):
        """Determina o nível de sensibilidade dos dados baseado no modelo"""
        # Dados de pacientes são sempre críticos
        if 'patient' in self.__class__.__name__.lower():
            return 'CRITICAL'
        
        # Dados médicos são de alta sensibilidade
        medical_models = ['condition', 'appointment', 'medication', 'alert']
        if any(term in self.__class__.__name__.lower() for term in medical_models):
            return 'HIGH'
        
        # Dados de usuários são de média sensibilidade
        if 'user' in self.__class__.__name__.lower():
            return 'MEDIUM'
        
        # Outros dados são de baixa sensibilidade
        return 'LOW'