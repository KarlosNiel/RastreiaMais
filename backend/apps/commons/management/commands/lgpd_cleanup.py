"""
Comando para limpeza automática de dados conforme políticas de retenção LGPD
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.commons.models import AuditLog, DataAccessLog
from apps.commons.utils import LGPDCompliance, AuditLogger
import logging

logger = logging.getLogger('apps.commons.lgpd')

class Command(BaseCommand):
    help = 'Executa limpeza automática de dados conforme políticas de retenção LGPD'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--audit-retention-days',
            type=int,
            default=2555,  # 7 anos
            help='Dias de retenção para logs de auditoria (padrão: 2555 - 7 anos)'
        )
        
        parser.add_argument(
            '--access-log-retention-days',
            type=int,
            default=365,  # 1 ano
            help='Dias de retenção para logs de acesso (padrão: 365 - 1 ano)'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Executa sem fazer alterações, apenas mostra o que seria feito'
        )
        
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força a execução sem confirmação'
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Iniciando limpeza automática LGPD...')
        )
        
        audit_retention_days = options['audit_retention_days']
        access_log_retention_days = options['access_log_retention_days']
        dry_run = options['dry_run']
        force = options['force']
        
        # Calcula datas de corte
        audit_cutoff = timezone.now() - timedelta(days=audit_retention_days)
        access_cutoff = timezone.now() - timedelta(days=access_log_retention_days)
        
        # Busca registros para limpeza
        old_audit_logs = AuditLog.objects.filter(timestamp__lt=audit_cutoff)
        old_access_logs = DataAccessLog.objects.filter(timestamp__lt=access_cutoff)
        
        audit_count = old_audit_logs.count()
        access_count = old_access_logs.count()
        
        self.stdout.write(f'Logs de auditoria para remoção: {audit_count}')
        self.stdout.write(f'Logs de acesso para remoção: {access_count}')
        
        if audit_count == 0 and access_count == 0:
            self.stdout.write(
                self.style.SUCCESS('Nenhum registro antigo encontrado para limpeza.')
            )
            return
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('Modo dry-run ativado. Nenhuma alteração será feita.')
            )
            return
        
        # Confirmação
        if not force:
            confirm = input(
                f'Tem certeza que deseja remover {audit_count + access_count} registros? (s/N): '
            )
            if confirm.lower() not in ['s', 'sim', 'y', 'yes']:
                self.stdout.write('Operação cancelada.')
                return
        
        # Executa limpeza
        try:
            # Remove logs de auditoria antigos
            if audit_count > 0:
                deleted_audit = old_audit_logs.delete()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Removidos {deleted_audit[0]} logs de auditoria antigos.'
                    )
                )
                
                # Log da limpeza
                AuditLogger.log_action(
                    action='DELETE',
                    content_type='AuditLog',
                    object_repr=f'Limpeza automática - {deleted_audit[0]} registros',
                    description=f'Limpeza automática de logs de auditoria com mais de {audit_retention_days} dias',
                    sensitivity_level='HIGH',
                    additional_data={
                        'deleted_count': deleted_audit[0],
                        'retention_days': audit_retention_days,
                        'cutoff_date': audit_cutoff.isoformat()
                    }
                )
            
            # Remove logs de acesso antigos
            if access_count > 0:
                deleted_access = old_access_logs.delete()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Removidos {deleted_access[0]} logs de acesso antigos.'
                    )
                )
                
                # Log da limpeza
                AuditLogger.log_action(
                    action='DELETE',
                    content_type='DataAccessLog',
                    object_repr=f'Limpeza automática - {deleted_access[0]} registros',
                    description=f'Limpeza automática de logs de acesso com mais de {access_log_retention_days} dias',
                    sensitivity_level='HIGH',
                    additional_data={
                        'deleted_count': deleted_access[0],
                        'retention_days': access_log_retention_days,
                        'cutoff_date': access_cutoff.isoformat()
                    }
                )
            
            self.stdout.write(
                self.style.SUCCESS('Limpeza automática concluída com sucesso!')
            )
            
        except Exception as e:
            logger.error(f'Erro durante limpeza automática: {e}')
            self.stdout.write(
                self.style.ERROR(f'Erro durante limpeza: {e}')
            )
            
            # Log do erro
            AuditLogger.log_action(
                action='CREATE',
                content_type='SystemError',
                object_repr='Erro na limpeza automática LGPD',
                description=f'Erro durante execução da limpeza automática: {str(e)}',
                sensitivity_level='HIGH',
                additional_data={'error': str(e)}
            )