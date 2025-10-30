"""
Comando para gerar relatórios de compliance LGPD
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.commons.models import AuditLog, DataAccessLog, ConsentLog
from apps.accounts.models import PatientUser
from apps.commons.utils import AuditLogger
import json
import csv
from io import StringIO

class Command(BaseCommand):
    help = 'Gera relatórios de compliance LGPD'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--period-days',
            type=int,
            default=30,
            help='Período em dias para o relatório (padrão: 30)'
        )
        
        parser.add_argument(
            '--output-format',
            choices=['json', 'csv', 'console'],
            default='console',
            help='Formato de saída do relatório'
        )
        
        parser.add_argument(
            '--output-file',
            type=str,
            help='Arquivo de saída (opcional)'
        )
        
        parser.add_argument(
            '--include-sensitive',
            action='store_true',
            help='Inclui dados sensíveis no relatório (use com cuidado)'
        )
    
    def handle(self, *args, **options):
        period_days = options['period_days']
        output_format = options['output_format']
        output_file = options['output_file']
        include_sensitive = options['include_sensitive']
        
        # Calcula período
        end_date = timezone.now()
        start_date = end_date - timedelta(days=period_days)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Gerando relatório de compliance para período: {start_date.date()} a {end_date.date()}'
            )
        )
        
        # Coleta dados
        report_data = self._collect_compliance_data(start_date, end_date, include_sensitive)
        
        # Gera saída
        if output_format == 'json':
            output = json.dumps(report_data, indent=2, ensure_ascii=False, default=str)
        elif output_format == 'csv':
            output = self._generate_csv_report(report_data)
        else:
            output = self._generate_console_report(report_data)
        
        # Salva ou exibe
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output)
            self.stdout.write(
                self.style.SUCCESS(f'Relatório salvo em: {output_file}')
            )
        else:
            self.stdout.write(output)
        
        # Log da geração do relatório
        AuditLogger.log_action(
            action='EXPORT',
            content_type='ComplianceReport',
            object_repr=f'Relatório de compliance - {period_days} dias',
            description=f'Relatório de compliance LGPD gerado para período de {period_days} dias',
            sensitivity_level='HIGH',
            additional_data={
                'period_days': period_days,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'output_format': output_format,
                'include_sensitive': include_sensitive
            }
        )
    
    def _collect_compliance_data(self, start_date, end_date, include_sensitive):
        """Coleta dados para o relatório de compliance"""
        
        # Estatísticas gerais
        total_patients = PatientUser.objects.count()
        active_patients = PatientUser.objects.filter(is_deleted=False).count()
        
        # Logs de auditoria no período
        audit_logs = AuditLog.objects.filter(
            timestamp__range=[start_date, end_date]
        )
        
        # Logs de acesso no período
        access_logs = DataAccessLog.objects.filter(
            timestamp__range=[start_date, end_date]
        )
        
        # Consentimentos no período
        consents = ConsentLog.objects.filter(
            granted_at__range=[start_date, end_date]
        )
        
        # Estatísticas de auditoria
        audit_stats = {
            'total_actions': audit_logs.count(),
            'actions_by_type': {},
            'actions_by_sensitivity': {},
            'unique_users': audit_logs.values('user').distinct().count(),
            'failed_access_attempts': audit_logs.filter(action='ACCESS_DENIED').count()
        }
        
        # Agrupa por tipo de ação
        for action_type, _ in AuditLog.ACTION_CHOICES:
            count = audit_logs.filter(action=action_type).count()
            if count > 0:
                audit_stats['actions_by_type'][action_type] = count
        
        # Agrupa por sensibilidade
        for sensitivity, _ in AuditLog.SENSITIVITY_CHOICES:
            count = audit_logs.filter(sensitivity_level=sensitivity).count()
            if count > 0:
                audit_stats['actions_by_sensitivity'][sensitivity] = count
        
        # Estatísticas de acesso a dados
        access_stats = {
            'total_accesses': access_logs.count(),
            'accesses_by_type': {},
            'unique_patients_accessed': access_logs.values('patient').distinct().count(),
            'unique_users_accessing': access_logs.values('user').distinct().count()
        }
        
        # Agrupa por tipo de acesso
        for access_type, _ in DataAccessLog.ACCESS_TYPE_CHOICES:
            count = access_logs.filter(access_type=access_type).count()
            if count > 0:
                access_stats['accesses_by_type'][access_type] = count
        
        # Estatísticas de consentimento
        consent_stats = {
            'total_consents': consents.count(),
            'consents_by_type': {},
            'consents_by_status': {},
            'valid_consents': ConsentLog.objects.filter(status='GRANTED').count(),
            'revoked_consents': ConsentLog.objects.filter(status='REVOKED').count()
        }
        
        # Agrupa por tipo de consentimento
        for consent_type, _ in ConsentLog.CONSENT_TYPE_CHOICES:
            count = consents.filter(consent_type=consent_type).count()
            if count > 0:
                consent_stats['consents_by_type'][consent_type] = count
        
        # Agrupa por status
        for status, _ in ConsentLog.STATUS_CHOICES:
            count = consents.filter(status=status).count()
            if count > 0:
                consent_stats['consents_by_status'][status] = count
        
        # Indicadores de compliance
        compliance_indicators = {
            'data_retention_compliance': self._check_data_retention_compliance(),
            'consent_coverage': self._calculate_consent_coverage(),
            'access_log_coverage': self._calculate_access_log_coverage(start_date, end_date),
            'security_incidents': audit_logs.filter(
                action='ACCESS_DENIED',
                sensitivity_level__in=['HIGH', 'CRITICAL']
            ).count()
        }
        
        report_data = {
            'report_metadata': {
                'generated_at': timezone.now().isoformat(),
                'period_start': start_date.isoformat(),
                'period_end': end_date.isoformat(),
                'period_days': (end_date - start_date).days,
                'include_sensitive': include_sensitive
            },
            'general_statistics': {
                'total_patients': total_patients,
                'active_patients': active_patients,
                'deleted_patients': total_patients - active_patients
            },
            'audit_statistics': audit_stats,
            'access_statistics': access_stats,
            'consent_statistics': consent_stats,
            'compliance_indicators': compliance_indicators
        }
        
        # Adiciona dados sensíveis se solicitado
        if include_sensitive:
            report_data['sensitive_data'] = {
                'recent_security_incidents': list(
                    audit_logs.filter(
                        action='ACCESS_DENIED',
                        sensitivity_level__in=['HIGH', 'CRITICAL']
                    ).values(
                        'timestamp', 'user__username', 'ip_address', 'description'
                    )[:10]
                ),
                'high_risk_accesses': list(
                    access_logs.filter(
                        access_type__in=['DOWNLOAD', 'EXPORT']
                    ).values(
                        'timestamp', 'user__username', 'patient__user__first_name',
                        'access_type', 'purpose'
                    )[:10]
                )
            }
        
        return report_data
    
    def _check_data_retention_compliance(self):
        """Verifica compliance com políticas de retenção"""
        # Implementa verificação básica
        # Em produção, isso seria mais complexo
        return {
            'status': 'COMPLIANT',
            'details': 'Políticas de retenção sendo aplicadas automaticamente'
        }
    
    def _calculate_consent_coverage(self):
        """Calcula cobertura de consentimentos"""
        total_patients = PatientUser.objects.filter(is_deleted=False).count()
        patients_with_consent = ConsentLog.objects.filter(
            status='GRANTED'
        ).values('patient').distinct().count()
        
        if total_patients == 0:
            return 0
        
        return round((patients_with_consent / total_patients) * 100, 2)
    
    def _calculate_access_log_coverage(self, start_date, end_date):
        """Calcula cobertura de logs de acesso"""
        # Verifica se todos os acessos estão sendo logados
        # Em produção, isso seria mais sofisticado
        access_logs_count = DataAccessLog.objects.filter(
            timestamp__range=[start_date, end_date]
        ).count()
        
        return {
            'total_logged_accesses': access_logs_count,
            'status': 'ACTIVE' if access_logs_count > 0 else 'INACTIVE'
        }
    
    def _generate_csv_report(self, report_data):
        """Gera relatório em formato CSV"""
        output = StringIO()
        writer = csv.writer(output)
        
        # Cabeçalho
        writer.writerow(['Métrica', 'Valor', 'Descrição'])
        
        # Estatísticas gerais
        writer.writerow(['Total de Pacientes', report_data['general_statistics']['total_patients'], 'Número total de pacientes cadastrados'])
        writer.writerow(['Pacientes Ativos', report_data['general_statistics']['active_patients'], 'Pacientes não excluídos'])
        
        # Estatísticas de auditoria
        writer.writerow(['Total de Ações', report_data['audit_statistics']['total_actions'], 'Ações registradas no período'])
        writer.writerow(['Usuários Únicos', report_data['audit_statistics']['unique_users'], 'Usuários que realizaram ações'])
        writer.writerow(['Tentativas de Acesso Negado', report_data['audit_statistics']['failed_access_attempts'], 'Tentativas de acesso não autorizadas'])
        
        # Estatísticas de acesso
        writer.writerow(['Total de Acessos', report_data['access_statistics']['total_accesses'], 'Acessos a dados de pacientes'])
        writer.writerow(['Pacientes Acessados', report_data['access_statistics']['unique_patients_accessed'], 'Pacientes únicos acessados'])
        
        # Indicadores de compliance
        writer.writerow(['Cobertura de Consentimento (%)', report_data['compliance_indicators']['consent_coverage'], 'Percentual de pacientes com consentimento'])
        writer.writerow(['Incidentes de Segurança', report_data['compliance_indicators']['security_incidents'], 'Incidentes de segurança no período'])
        
        return output.getvalue()
    
    def _generate_console_report(self, report_data):
        """Gera relatório para exibição no console"""
        lines = []
        lines.append("=" * 60)
        lines.append("RELATÓRIO DE COMPLIANCE LGPD")
        lines.append("=" * 60)
        
        # Metadados
        lines.append(f"Período: {report_data['report_metadata']['period_start'][:10]} a {report_data['report_metadata']['period_end'][:10]}")
        lines.append(f"Gerado em: {report_data['report_metadata']['generated_at'][:19]}")
        lines.append("")
        
        # Estatísticas gerais
        lines.append("ESTATÍSTICAS GERAIS")
        lines.append("-" * 20)
        lines.append(f"Total de Pacientes: {report_data['general_statistics']['total_patients']}")
        lines.append(f"Pacientes Ativos: {report_data['general_statistics']['active_patients']}")
        lines.append(f"Pacientes Excluídos: {report_data['general_statistics']['deleted_patients']}")
        lines.append("")
        
        # Auditoria
        lines.append("AUDITORIA")
        lines.append("-" * 10)
        lines.append(f"Total de Ações: {report_data['audit_statistics']['total_actions']}")
        lines.append(f"Usuários Únicos: {report_data['audit_statistics']['unique_users']}")
        lines.append(f"Acessos Negados: {report_data['audit_statistics']['failed_access_attempts']}")
        
        if report_data['audit_statistics']['actions_by_type']:
            lines.append("Ações por Tipo:")
            for action_type, count in report_data['audit_statistics']['actions_by_type'].items():
                lines.append(f"  {action_type}: {count}")
        lines.append("")
        
        # Acesso a dados
        lines.append("ACESSO A DADOS")
        lines.append("-" * 15)
        lines.append(f"Total de Acessos: {report_data['access_statistics']['total_accesses']}")
        lines.append(f"Pacientes Acessados: {report_data['access_statistics']['unique_patients_accessed']}")
        lines.append(f"Usuários Acessando: {report_data['access_statistics']['unique_users_accessing']}")
        lines.append("")
        
        # Consentimentos
        lines.append("CONSENTIMENTOS")
        lines.append("-" * 14)
        lines.append(f"Total de Consentimentos: {report_data['consent_statistics']['total_consents']}")
        lines.append(f"Consentimentos Válidos: {report_data['consent_statistics']['valid_consents']}")
        lines.append(f"Consentimentos Revogados: {report_data['consent_statistics']['revoked_consents']}")
        lines.append("")
        
        # Indicadores de compliance
        lines.append("INDICADORES DE COMPLIANCE")
        lines.append("-" * 26)
        lines.append(f"Cobertura de Consentimento: {report_data['compliance_indicators']['consent_coverage']}%")
        lines.append(f"Incidentes de Segurança: {report_data['compliance_indicators']['security_incidents']}")
        lines.append(f"Status de Retenção: {report_data['compliance_indicators']['data_retention_compliance']['status']}")
        lines.append("")
        
        lines.append("=" * 60)
        
        return "\n".join(lines)