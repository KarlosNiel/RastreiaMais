from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import AuditLog, DataAccessLog, ConsentLog
import json

# Base admin class para outros apps
class BaseModelAdmin(admin.ModelAdmin):
    """
    Classe base para admin de modelos que herdam de BaseModel
    """
    list_display = ['id', 'created_at', 'updated_at', 'created_by', 'is_deleted']
    list_filter = ['is_deleted', 'created_at', 'updated_at']
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_by', 'deleted_at')
    
    def get_queryset(self, request):
        # Mostra todos os objetos, incluindo os soft-deleted
        return self.model.all_objects.get_queryset()
    
    def save_model(self, request, obj, form, change):
        if not change:  # Se é criação
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Admin para visualização dos logs de auditoria
    """
    list_display = [
        'timestamp', 'user', 'action', 'content_type', 
        'object_repr', 'sensitivity_level', 'ip_address'
    ]
    list_filter = [
        'action', 'sensitivity_level', 'timestamp', 'content_type'
    ]
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'object_repr', 'description', 'ip_address'
    ]
    readonly_fields = [
        'user', 'action', 'timestamp', 'content_type', 'object_id',
        'object_repr', 'changes_formatted', 'old_values_formatted',
        'new_values_formatted', 'ip_address', 'user_agent', 'session_key',
        'sensitivity_level', 'description', 'additional_data_formatted'
    ]
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    def has_add_permission(self, request):
        """Não permite adicionar logs manualmente"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Não permite editar logs"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Não permite deletar logs"""
        return False
    
    def changes_formatted(self, obj):
        """Formata as mudanças para exibição"""
        if obj.changes:
            return format_html('<pre>{}</pre>', json.dumps(obj.changes, indent=2, ensure_ascii=False))
        return '-'
    changes_formatted.short_description = 'Mudanças'
    
    def old_values_formatted(self, obj):
        """Formata valores antigos para exibição"""
        if obj.old_values:
            return format_html('<pre>{}</pre>', json.dumps(obj.old_values, indent=2, ensure_ascii=False))
        return '-'
    old_values_formatted.short_description = 'Valores Anteriores'
    
    def new_values_formatted(self, obj):
        """Formata novos valores para exibição"""
        if obj.new_values:
            return format_html('<pre>{}</pre>', json.dumps(obj.new_values, indent=2, ensure_ascii=False))
        return '-'
    new_values_formatted.short_description = 'Novos Valores'
    
    def additional_data_formatted(self, obj):
        """Formata dados adicionais para exibição"""
        if obj.additional_data:
            return format_html('<pre>{}</pre>', json.dumps(obj.additional_data, indent=2, ensure_ascii=False))
        return '-'
    additional_data_formatted.short_description = 'Dados Adicionais'

@admin.register(DataAccessLog)
class DataAccessLogAdmin(admin.ModelAdmin):
    """
    Admin para visualização dos logs de acesso a dados
    """
    list_display = [
        'timestamp', 'user', 'patient', 'access_type', 
        'purpose_short', 'ip_address'
    ]
    list_filter = [
        'access_type', 'timestamp'
    ]
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'patient__user__first_name', 'patient__user__last_name',
        'purpose', 'ip_address'
    ]
    readonly_fields = [
        'user', 'patient', 'access_type', 'timestamp', 'ip_address',
        'user_agent', 'data_fields_formatted', 'purpose', 'legal_basis',
        'retention_period'
    ]
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    def has_add_permission(self, request):
        """Não permite adicionar logs manualmente"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Não permite editar logs"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Não permite deletar logs"""
        return False
    
    def purpose_short(self, obj):
        """Versão resumida da finalidade"""
        if len(obj.purpose) > 50:
            return obj.purpose[:50] + '...'
        return obj.purpose
    purpose_short.short_description = 'Finalidade'
    
    def data_fields_formatted(self, obj):
        """Formata campos acessados para exibição"""
        if obj.data_fields:
            return format_html('<pre>{}</pre>', json.dumps(obj.data_fields, indent=2, ensure_ascii=False))
        return '-'
    data_fields_formatted.short_description = 'Campos Acessados'

@admin.register(ConsentLog)
class ConsentLogAdmin(admin.ModelAdmin):
    """
    Admin para gerenciamento de consentimentos
    """
    list_display = [
        'patient', 'consent_type', 'status', 'granted_at', 
        'expires_at', 'is_valid_display'
    ]
    list_filter = [
        'consent_type', 'status', 'granted_at', 'expires_at'
    ]
    search_fields = [
        'patient__user__first_name', 'patient__user__last_name',
        'purpose', 'legal_basis'
    ]
    readonly_fields = [
        'granted_at', 'ip_address', 'user_agent', 'is_valid_display'
    ]
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('patient', 'consent_type', 'status')
        }),
        ('Datas', {
            'fields': ('granted_at', 'revoked_at', 'expires_at', 'is_valid_display')
        }),
        ('Detalhes do Consentimento', {
            'fields': ('purpose', 'data_categories_formatted', 'legal_basis', 'consent_text')
        }),
        ('Evidências', {
            'fields': ('evidence_file',)
        }),
        ('Informações Técnicas', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        })
    )
    date_hierarchy = 'granted_at'
    ordering = ['-granted_at']
    
    def is_valid_display(self, obj):
        """Exibe se o consentimento é válido"""
        if obj.is_valid():
            return format_html('<span style="color: green;">✓ Válido</span>')
        else:
            return format_html('<span style="color: red;">✗ Inválido</span>')
    is_valid_display.short_description = 'Status de Validade'
    
    def data_categories_formatted(self, obj):
        """Formata categorias de dados para exibição"""
        if obj.data_categories:
            return format_html('<pre>{}</pre>', json.dumps(obj.data_categories, indent=2, ensure_ascii=False))
        return '-'
    data_categories_formatted.short_description = 'Categorias de Dados'
    
    actions = ['revoke_consents']
    
    def revoke_consents(self, request, queryset):
        """Ação para revogar consentimentos selecionados"""
        from .utils import LGPDCompliance
        
        revoked_count = 0
        for consent in queryset.filter(status='GRANTED'):
            if LGPDCompliance.revoke_consent(consent.id, "Revogado via admin"):
                revoked_count += 1
        
        self.message_user(
            request,
            f'{revoked_count} consentimento(s) revogado(s) com sucesso.'
        )
    revoke_consents.short_description = 'Revogar consentimentos selecionados'

# Customização do admin site
admin.site.site_header = 'Rastreia+ - Sistema de Auditoria'
admin.site.site_title = 'Auditoria Rastreia+'
admin.site.index_title = 'Painel de Auditoria e Compliance LGPD'