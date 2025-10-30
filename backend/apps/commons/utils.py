"""
Utilitários para auditoria e compliance com LGPD
"""
import hashlib
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from .models import AuditLog, DataAccessLog, ConsentLog
from .middleware import get_current_user, get_current_request

class AuditLogger:
    """
    Classe utilitária para facilitar o registro de logs de auditoria
    """
    
    @staticmethod
    def log_action(action, content_type=None, object_id=None, object_repr=None, 
                   description=None, sensitivity_level='MEDIUM', additional_data=None):
        """
        Registra uma ação de auditoria
        """
        try:
            user = get_current_user()
            request = get_current_request()
            
            AuditLog.objects.create(
                user=user,
                action=action,
                content_type=content_type,
                object_id=str(object_id) if object_id else None,
                object_repr=object_repr,
                ip_address=AuditLogger._get_client_ip(request) if request else None,
                user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
                session_key=request.session.session_key if request and hasattr(request, 'session') else None,
                sensitivity_level=sensitivity_level,
                description=description,
                additional_data=additional_data
            )
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.audit')
            logger.error(f"Erro ao registrar log de auditoria: {e}")
    
    @staticmethod
    def log_data_access(patient, access_type='VIEW', data_fields=None, purpose=None):
        """
        Registra acesso a dados de paciente
        """
        try:
            user = get_current_user()
            request = get_current_request()
            
            if not user or not patient:
                return
            
            DataAccessLog.objects.create(
                user=user,
                patient=patient,
                access_type=access_type,
                ip_address=AuditLogger._get_client_ip(request) if request else None,
                user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
                data_fields=data_fields or [],
                purpose=purpose or "Acesso para prestação de cuidados de saúde",
                legal_basis="Consentimento do titular - Art. 7º, I da LGPD"
            )
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.audit')
            logger.error(f"Erro ao registrar acesso a dados: {e}")
    
    @staticmethod
    def _get_client_ip(request):
        """Obtém o IP real do cliente"""
        if not request:
            return None
            
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LGPDCompliance:
    """
    Classe para funcionalidades de compliance com LGPD
    """
    
    @staticmethod
    def create_consent(patient, consent_type, purpose, data_categories, 
                      consent_text, legal_basis=None):
        """
        Cria um registro de consentimento
        """
        try:
            request = get_current_request()
            
            consent = ConsentLog.objects.create(
                patient=patient,
                consent_type=consent_type,
                purpose=purpose,
                data_categories=data_categories,
                legal_basis=legal_basis or "Consentimento livre, informado e inequívoco - Art. 8º da LGPD",
                consent_text=consent_text,
                ip_address=AuditLogger._get_client_ip(request) if request else None,
                user_agent=request.META.get('HTTP_USER_AGENT', '') if request else ''
            )
            
            # Log da criação do consentimento
            AuditLogger.log_action(
                action='CREATE',
                content_type='ConsentLog',
                object_id=consent.id,
                object_repr=str(consent),
                description=f"Consentimento criado para {patient}",
                sensitivity_level='CRITICAL'
            )
            
            return consent
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.lgpd')
            logger.error(f"Erro ao criar consentimento: {e}")
            return None
    
    @staticmethod
    def revoke_consent(consent_id, reason=None):
        """
        Revoga um consentimento
        """
        try:
            consent = ConsentLog.objects.get(id=consent_id)
            consent.status = 'REVOKED'
            consent.revoked_at = datetime.now()
            consent.save()
            
            # Log da revogação
            AuditLogger.log_action(
                action='UPDATE',
                content_type='ConsentLog',
                object_id=consent.id,
                object_repr=str(consent),
                description=f"Consentimento revogado: {reason or 'Sem motivo especificado'}",
                sensitivity_level='CRITICAL',
                additional_data={'reason': reason}
            )
            
            return True
            
        except ConsentLog.DoesNotExist:
            return False
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.lgpd')
            logger.error(f"Erro ao revogar consentimento: {e}")
            return False
    
    @staticmethod
    def check_data_retention(model_class, retention_days=2555):  # 7 anos padrão
        """
        Verifica dados que podem ser excluídos por retenção
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            
            # Busca registros antigos que podem ser excluídos
            old_records = model_class.objects.filter(
                created_at__lt=cutoff_date,
                is_deleted=False
            )
            
            return old_records
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.lgpd')
            logger.error(f"Erro ao verificar retenção de dados: {e}")
            return model_class.objects.none()
    
    @staticmethod
    def anonymize_patient_data(patient):
        """
        Anonimiza dados de um paciente (para direito ao esquecimento)
        """
        try:
            # Gera hash único para manter referências
            anonymous_id = hashlib.sha256(f"anonymous_{patient.id}_{datetime.now()}".encode()).hexdigest()[:16]
            
            # Anonimiza dados do usuário
            user = patient.user
            user.first_name = f"Anônimo_{anonymous_id}"
            user.last_name = ""
            user.email = f"anonimo_{anonymous_id}@anonimizado.local"
            user.username = f"anonimo_{anonymous_id}"
            user.is_active = False
            user.save()
            
            # Log da anonimização
            AuditLogger.log_action(
                action='UPDATE',
                content_type='PatientUser',
                object_id=patient.id,
                object_repr=f"Paciente anonimizado: {anonymous_id}",
                description="Dados do paciente anonimizados conforme direito ao esquecimento",
                sensitivity_level='CRITICAL',
                additional_data={'anonymous_id': anonymous_id, 'original_patient_id': patient.id}
            )
            
            return True
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.lgpd')
            logger.error(f"Erro ao anonimizar dados do paciente: {e}")
            return False
    
    @staticmethod
    def generate_data_portability_report(patient):
        """
        Gera relatório de portabilidade de dados (Art. 18, V da LGPD)
        """
        try:
            from apps.conditions.models import DCNT, HAS, DM, OtherDCNT
            from apps.appointments.models import Appointment
            from apps.medications.models import Medication
            from apps.alerts.models import Alert
            
            data = {
                'patient_info': {
                    'id': patient.id,
                    'name': patient.user.get_full_name(),
                    'email': patient.user.email,
                    'created_at': patient.created_at.isoformat(),
                },
                'conditions': [],
                'appointments': [],
                'medications': [],
                'alerts': [],
                'consents': [],
                'access_logs': []
            }
            
            # Coleta dados de condições
            for condition in DCNT.objects.filter(patient=patient):
                condition_data = {
                    'type': condition.__class__.__name__,
                    'is_diagnosed': condition.is_diagnosed,
                    'uses_medication': condition.uses_medication,
                    'medications_name': condition.medications_name,
                    'family_history': condition.family_history,
                    'created_at': condition.created_at.isoformat()
                }
                
                # Adiciona campos específicos
                if isinstance(condition, HAS):
                    condition_data['complications'] = condition.any_complications_HBP
                elif isinstance(condition, DM):
                    condition_data['treatment_type'] = condition.treatment_type
                    condition_data['comorbidities'] = condition.diabetes_comorbidities
                    condition_data['diabetic_foot'] = condition.diabetic_foot
                elif isinstance(condition, OtherDCNT):
                    condition_data['name'] = condition.name
                
                data['conditions'].append(condition_data)
            
            # Coleta dados de consultas
            for appointment in Appointment.objects.filter(patient=patient):
                data['appointments'].append({
                    'professional': appointment.professional.user.get_full_name(),
                    'scheduled_datetime': appointment.scheduled_datetime.isoformat(),
                    'type': appointment.type,
                    'status': appointment.status,
                    'risk_level': appointment.risk_level,
                    'description': appointment.description,
                    'created_at': appointment.created_at.isoformat()
                })
            
            # Coleta consentimentos
            for consent in ConsentLog.objects.filter(patient=patient):
                data['consents'].append({
                    'consent_type': consent.consent_type,
                    'status': consent.status,
                    'purpose': consent.purpose,
                    'granted_at': consent.granted_at.isoformat(),
                    'revoked_at': consent.revoked_at.isoformat() if consent.revoked_at else None
                })
            
            # Coleta logs de acesso (últimos 90 dias)
            recent_access = DataAccessLog.objects.filter(
                patient=patient,
                timestamp__gte=datetime.now() - timedelta(days=90)
            )
            
            for access in recent_access:
                data['access_logs'].append({
                    'user': access.user.get_full_name() if access.user else 'Sistema',
                    'access_type': access.access_type,
                    'timestamp': access.timestamp.isoformat(),
                    'purpose': access.purpose
                })
            
            # Log da geração do relatório
            AuditLogger.log_action(
                action='EXPORT',
                content_type='DataPortabilityReport',
                object_id=patient.id,
                object_repr=f"Relatório de portabilidade para {patient}",
                description="Relatório de portabilidade de dados gerado",
                sensitivity_level='CRITICAL'
            )
            
            return data
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.lgpd')
            logger.error(f"Erro ao gerar relatório de portabilidade: {e}")
            return None
    
    @staticmethod
    def send_data_breach_notification(breach_description, affected_patients_count, 
                                    severity='HIGH', containment_measures=None):
        """
        Envia notificação de violação de dados (Art. 48 da LGPD)
        """
        try:
            # Log do incidente
            AuditLogger.log_action(
                action='CREATE',
                content_type='DataBreach',
                object_repr=f"Violação de dados - {affected_patients_count} pacientes afetados",
                description=breach_description,
                sensitivity_level='CRITICAL',
                additional_data={
                    'affected_patients_count': affected_patients_count,
                    'severity': severity,
                    'containment_measures': containment_measures,
                    'notification_sent_at': datetime.now().isoformat()
                }
            )
            
            # Aqui você implementaria o envio real da notificação
            # para a ANPD e para os titulares afetados
            
            return True
            
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.commons.lgpd')
            logger.error(f"Erro ao notificar violação de dados: {e}")
            return False

class DataMinimization:
    """
    Classe para implementar princípio da minimização de dados
    """
    
    @staticmethod
    def get_minimal_patient_data(patient, purpose='TREATMENT'):
        """
        Retorna apenas os dados mínimos necessários para a finalidade
        """
        minimal_data = {
            'id': patient.id,
            'name': patient.user.get_full_name()
        }
        
        if purpose == 'TREATMENT':
            # Para tratamento, inclui dados médicos relevantes
            minimal_data.update({
                'conditions': patient.dcnt_set.filter(is_diagnosed=True),
                'active_medications': patient.dcnt_set.filter(uses_medication=True)
            })
        elif purpose == 'APPOINTMENT':
            # Para agendamento, inclui apenas dados básicos
            minimal_data.update({
                'phone': getattr(patient, 'phone', None),
                'email': patient.user.email
            })
        elif purpose == 'STATISTICS':
            # Para estatísticas, remove identificadores
            minimal_data = {
                'age_group': patient.get_age_group() if hasattr(patient, 'get_age_group') else None,
                'conditions_count': patient.dcnt_set.count()
            }
        
        return minimal_data