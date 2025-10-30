"""
Middleware para auditoria e compliance com LGPD
"""
import json
import logging
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
from .models import AuditLog, DataAccessLog
from django.urls import resolve
from django.http import JsonResponse
import threading

# Thread local para armazenar informações da requisição
_thread_locals = threading.local()

def get_current_request():
    """Retorna a requisição atual do thread local"""
    return getattr(_thread_locals, 'request', None)

def get_current_user():
    """Retorna o usuário atual do thread local"""
    request = get_current_request()
    if request and hasattr(request, 'user'):
        return request.user if not isinstance(request.user, AnonymousUser) else None
    return None

class AuditMiddleware(MiddlewareMixin):
    """
    Middleware para capturar e registrar todas as ações do sistema
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('apps.commons.audit')
        super().__init__(get_response)
    
    def process_request(self, request):
        """Processa a requisição e armazena informações no thread local"""
        _thread_locals.request = request
        
        # Registra tentativas de login
        if request.path.endswith('/api/token/') and request.method == 'POST':
            self._log_login_attempt(request)
        
        # Registra acessos a dados sensíveis
        if self._is_sensitive_endpoint(request.path):
            self._log_data_access(request)
    
    def process_response(self, request, response):
        """Processa a resposta e registra logs de auditoria"""
        try:
            # Registra logout
            if request.path.endswith('/api/logout/') and response.status_code == 200:
                self._log_logout(request)
            
            # Registra acessos negados
            if response.status_code in [401, 403]:
                self._log_access_denied(request, response)
            
            # Registra exportações de dados
            if self._is_export_endpoint(request.path) and response.status_code == 200:
                self._log_data_export(request)
                
        except Exception as e:
            self.logger.error(f"Erro no middleware de auditoria: {e}")
        
        return response
    
    def _log_login_attempt(self, request):
        """Registra tentativas de login"""
        try:
            body = json.loads(request.body.decode('utf-8')) if request.body else {}
            username = body.get('username', 'Desconhecido')
            
            AuditLog.objects.create(
                user=None,  # Ainda não autenticado
                action='LOGIN',
                content_type='Authentication',
                object_repr=f"Tentativa de login: {username}",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_key=request.session.session_key,
                sensitivity_level='HIGH',
                description=f"Tentativa de login para usuário: {username}",
                additional_data={'username': username}
            )
        except Exception as e:
            self.logger.error(f"Erro ao registrar tentativa de login: {e}")
    
    def _log_logout(self, request):
        """Registra logout do usuário"""
        try:
            AuditLog.objects.create(
                user=request.user if hasattr(request, 'user') else None,
                action='LOGOUT',
                content_type='Authentication',
                object_repr=f"Logout: {request.user.username if hasattr(request, 'user') else 'Desconhecido'}",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_key=request.session.session_key,
                sensitivity_level='MEDIUM',
                description="Logout do sistema"
            )
        except Exception as e:
            self.logger.error(f"Erro ao registrar logout: {e}")
    
    def _log_access_denied(self, request, response):
        """Registra tentativas de acesso negado"""
        try:
            AuditLog.objects.create(
                user=request.user if hasattr(request, 'user') and not isinstance(request.user, AnonymousUser) else None,
                action='ACCESS_DENIED',
                content_type='Security',
                object_repr=f"Acesso negado: {request.path}",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_key=request.session.session_key,
                sensitivity_level='HIGH',
                description=f"Acesso negado ao endpoint: {request.path}",
                additional_data={
                    'method': request.method,
                    'status_code': response.status_code,
                    'path': request.path
                }
            )
        except Exception as e:
            self.logger.error(f"Erro ao registrar acesso negado: {e}")
    
    def _log_data_access(self, request):
        """Registra acessos a dados sensíveis"""
        try:
            if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser):
                return
            
            # Identifica se é acesso a dados de paciente
            patient_id = self._extract_patient_id(request.path)
            if patient_id:
                from apps.accounts.models import PatientUser
                try:
                    patient = PatientUser.objects.get(id=patient_id)
                    
                    DataAccessLog.objects.create(
                        user=request.user,
                        patient=patient,
                        access_type='VIEW',
                        ip_address=self._get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        data_fields=self._get_accessed_fields(request.path),
                        purpose="Acesso via API para visualização de dados",
                        legal_basis="Consentimento do titular - Art. 7º, I da LGPD"
                    )
                except PatientUser.DoesNotExist:
                    pass
                    
        except Exception as e:
            self.logger.error(f"Erro ao registrar acesso a dados: {e}")
    
    def _log_data_export(self, request):
        """Registra exportações de dados"""
        try:
            AuditLog.objects.create(
                user=request.user if hasattr(request, 'user') else None,
                action='EXPORT',
                content_type='DataExport',
                object_repr=f"Exportação de dados: {request.path}",
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_key=request.session.session_key,
                sensitivity_level='CRITICAL',
                description=f"Exportação de dados do endpoint: {request.path}",
                additional_data={
                    'method': request.method,
                    'path': request.path
                }
            )
        except Exception as e:
            self.logger.error(f"Erro ao registrar exportação: {e}")
    
    def _get_client_ip(self, request):
        """Obtém o IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _is_sensitive_endpoint(self, path):
        """Verifica se o endpoint acessa dados sensíveis"""
        sensitive_patterns = [
            '/api/v1/accounts/patients/',
            '/api/v1/conditions/',
            '/api/v1/appointments/',
            '/api/v1/medications/',
            '/api/v1/alerts/'
        ]
        return any(pattern in path for pattern in sensitive_patterns)
    
    def _is_export_endpoint(self, path):
        """Verifica se o endpoint é de exportação"""
        export_patterns = [
            '/export/',
            '/download/',
            '/report/',
            '/pdf/'
        ]
        return any(pattern in path for pattern in export_patterns)
    
    def _extract_patient_id(self, path):
        """Extrai ID do paciente da URL"""
        try:
            if '/patients/' in path:
                parts = path.split('/patients/')
                if len(parts) > 1:
                    patient_part = parts[1].split('/')[0]
                    if patient_part.isdigit():
                        return int(patient_part)
        except:
            pass
        return None
    
    def _get_accessed_fields(self, path):
        """Determina quais campos foram acessados baseado no endpoint"""
        field_mapping = {
            '/patients/': ['nome', 'cpf', 'telefone', 'endereco'],
            '/conditions/': ['diagnostico', 'medicamentos', 'historico_familiar'],
            '/appointments/': ['data_consulta', 'profissional', 'descricao'],
            '/medications/': ['nome_medicamento', 'dosagem', 'frequencia'],
            '/alerts/': ['tipo_alerta', 'descricao', 'nivel_risco']
        }
        
        for pattern, fields in field_mapping.items():
            if pattern in path:
                return fields
        
        return ['dados_gerais']

class LGPDComplianceMiddleware(MiddlewareMixin):
    """
    Middleware para garantir compliance com LGPD
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('apps.commons.lgpd')
        super().__init__(get_response)
    
    def process_request(self, request):
        """Verifica compliance antes de processar a requisição"""
        
        # Verifica se há consentimento válido para acessar dados de paciente
        if self._requires_consent_check(request.path) and hasattr(request, 'user'):
            patient_id = self._extract_patient_id(request.path)
            if patient_id and not self._has_valid_consent(patient_id, request.user):
                return JsonResponse({
                    'error': 'Acesso negado',
                    'message': 'Consentimento necessário para acessar estes dados',
                    'code': 'CONSENT_REQUIRED'
                }, status=403)
        
        # Adiciona headers de privacidade
        return None
    
    def process_response(self, request, response):
        """Adiciona headers de compliance na resposta"""
        
        # Headers de privacidade
        response['X-Privacy-Policy'] = '/privacy-policy'
        response['X-Data-Controller'] = 'Rastreia+ Sistema de Saúde'
        response['X-LGPD-Compliance'] = 'true'
        
        # Remove dados sensíveis dos logs em caso de erro
        if response.status_code >= 400:
            self._sanitize_error_response(response)
        
        return response
    
    def _requires_consent_check(self, path):
        """Verifica se o endpoint requer verificação de consentimento"""
        consent_required_patterns = [
            '/api/v1/accounts/patients/',
            '/api/v1/conditions/',
            '/api/v1/appointments/'
        ]
        return any(pattern in path for pattern in consent_required_patterns)
    
    def _extract_patient_id(self, path):
        """Extrai ID do paciente da URL"""
        try:
            if '/patients/' in path:
                parts = path.split('/patients/')
                if len(parts) > 1:
                    patient_part = parts[1].split('/')[0]
                    if patient_part.isdigit():
                        return int(patient_part)
        except:
            pass
        return None
    
    def _has_valid_consent(self, patient_id, user):
        """Verifica se há consentimento válido para o acesso"""
        try:
            from apps.commons.models import ConsentLog
            from apps.accounts.models import PatientUser
            
            patient = PatientUser.objects.get(id=patient_id)
            
            # Verifica se há consentimento válido para processamento de dados
            consent = ConsentLog.objects.filter(
                patient=patient,
                consent_type='DATA_PROCESSING',
                status='GRANTED'
            ).first()
            
            return consent and consent.is_valid()
            
        except Exception as e:
            self.logger.error(f"Erro ao verificar consentimento: {e}")
            return False
    
    def _sanitize_error_response(self, response):
        """Remove dados sensíveis das respostas de erro"""
        try:
            if hasattr(response, 'content'):
                # Aqui você pode implementar lógica para remover dados sensíveis
                # dos erros antes de retornar ao cliente
                pass
        except Exception as e:
            self.logger.error(f"Erro ao sanitizar resposta: {e}")