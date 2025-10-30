# 🔒 Sistema de Auditoria e Compliance LGPD

## 📋 Visão Geral

Este sistema implementa um robusto sistema de auditoria e compliance com a LGPD (Lei Geral de Proteção de Dados) para o Rastreia+. Todas as ações realizadas no sistema são registradas automaticamente, garantindo rastreabilidade completa e conformidade legal.

## 🎯 Funcionalidades Implementadas

### ✅ **Logs de Auditoria Completos**
- **Registro automático** de todas as ações (CREATE, UPDATE, DELETE, VIEW, etc.)
- **Rastreamento de mudanças** com valores antigos e novos
- **Informações técnicas** (IP, User Agent, Sessão)
- **Classificação de sensibilidade** (LOW, MEDIUM, HIGH, CRITICAL)
- **Contexto completo** de cada ação realizada

### ✅ **Logs de Acesso a Dados**
- **Registro específico** para acesso a dados de pacientes
- **Finalidade documentada** para cada acesso
- **Base legal** conforme LGPD
- **Campos acessados** detalhadamente registrados
- **Compliance com Art. 37 da LGPD**

### ✅ **Gestão de Consentimentos**
- **Registro de consentimentos** com evidências
- **Controle de validade** e expiração
- **Revogação de consentimentos**
- **Diferentes tipos** (processamento, compartilhamento, etc.)
- **Compliance com Art. 8º da LGPD**

### ✅ **Middleware de Auditoria**
- **Interceptação automática** de todas as requisições
- **Detecção de acessos sensíveis**
- **Registro de tentativas de login/logout**
- **Monitoramento de acessos negados**
- **Verificação de consentimentos**

### ✅ **Ferramentas de Compliance**
- **Anonimização de dados** (direito ao esquecimento)
- **Relatórios de portabilidade** (Art. 18, V da LGPD)
- **Limpeza automática** por políticas de retenção
- **Notificação de violações** de dados
- **Minimização de dados** por finalidade

## 🏗️ Arquitetura do Sistema

### **Modelos Principais**

#### `AuditLog`
```python
# Registra todas as ações do sistema
- user: Usuário que realizou a ação
- action: Tipo de ação (CREATE, UPDATE, DELETE, etc.)
- content_type: Tipo de objeto afetado
- changes: Mudanças realizadas (JSON)
- sensitivity_level: Nível de sensibilidade
- ip_address: IP do usuário
- timestamp: Data/hora da ação
```

#### `DataAccessLog`
```python
# Registra acessos específicos a dados de pacientes
- user: Usuário que acessou
- patient: Paciente cujos dados foram acessados
- access_type: Tipo de acesso (VIEW, DOWNLOAD, etc.)
- data_fields: Campos específicos acessados
- purpose: Finalidade do acesso
- legal_basis: Base legal para o acesso
```

#### `ConsentLog`
```python
# Gerencia consentimentos dos titulares
- patient: Paciente que concedeu o consentimento
- consent_type: Tipo de consentimento
- status: Status (GRANTED, REVOKED, EXPIRED)
- purpose: Finalidade do consentimento
- data_categories: Categorias de dados envolvidas
- consent_text: Texto completo do consentimento
```

### **Middleware Implementado**

#### `AuditMiddleware`
- Intercepta todas as requisições HTTP
- Registra ações de login/logout automaticamente
- Detecta acessos a endpoints sensíveis
- Registra tentativas de acesso negado
- Logs estruturados para análise

#### `LGPDComplianceMiddleware`
- Verifica consentimentos antes do acesso
- Adiciona headers de privacidade
- Sanitiza respostas de erro
- Bloqueia acessos sem consentimento válido

## 🛠️ Comandos de Gerenciamento

### **Limpeza Automática LGPD**
```bash
# Executa limpeza conforme políticas de retenção
python manage.py lgpd_cleanup

# Opções disponíveis:
--audit-retention-days 2555    # Retenção de logs de auditoria (7 anos)
--access-log-retention-days 365 # Retenção de logs de acesso (1 ano)
--dry-run                       # Simula sem executar
--force                         # Executa sem confirmação
```

### **Relatórios de Compliance**
```bash
# Gera relatório de compliance
python manage.py generate_compliance_report

# Opções disponíveis:
--period-days 30                # Período do relatório
--output-format json|csv|console # Formato de saída
--output-file relatorio.json    # Arquivo de saída
--include-sensitive             # Inclui dados sensíveis
```

## 📊 Painel Administrativo

### **Visualização de Logs**
- **Interface administrativa** completa para visualização
- **Filtros avançados** por usuário, ação, sensibilidade
- **Busca textual** em descrições e objetos
- **Formatação JSON** para mudanças e dados
- **Navegação temporal** por data

### **Gestão de Consentimentos**
- **Visualização de status** de consentimentos
- **Ações em lote** para revogação
- **Indicadores visuais** de validade
- **Histórico completo** de mudanças

## 🔐 Níveis de Sensibilidade

### **CRITICAL** 🔴
- Dados de pacientes
- Informações médicas
- Consentimentos
- Violações de dados

### **HIGH** 🟠
- Dados de usuários
- Acessos negados
- Exportações de dados
- Logs de segurança

### **MEDIUM** 🟡
- Ações administrativas
- Configurações do sistema
- Relatórios gerais

### **LOW** 🟢
- Dados públicos
- Logs de sistema
- Configurações básicas

## 📋 Compliance LGPD

### **Artigos Atendidos**

#### **Art. 8º - Consentimento**
✅ Sistema completo de gestão de consentimentos
✅ Registro de evidências e revogações
✅ Controle de validade e expiração

#### **Art. 18 - Direitos do Titular**
✅ **Inciso V** - Portabilidade de dados implementada
✅ **Direito ao esquecimento** com anonimização
✅ **Acesso aos dados** via relatórios

#### **Art. 37 - Registro de Operações**
✅ Logs detalhados de todas as operações
✅ Finalidade e base legal documentadas
✅ Retenção conforme necessidade

#### **Art. 48 - Comunicação de Incidentes**
✅ Sistema de notificação de violações
✅ Registro automático de incidentes
✅ Rastreabilidade completa

### **Princípios Implementados**

#### **Transparência**
- Logs detalhados e acessíveis
- Documentação completa de processos
- Relatórios de compliance automáticos

#### **Minimização**
- Coleta apenas de dados necessários
- Acesso baseado na finalidade
- Retenção por tempo determinado

#### **Segurança**
- Criptografia de dados sensíveis
- Controle de acesso rigoroso
- Monitoramento contínuo

## 🚀 Como Usar

### **1. Configuração Inicial**
```python
# As configurações já estão aplicadas automaticamente
# Middleware ativo em todas as requisições
# Models registrados no admin
```

### **2. Registro Manual de Auditoria**
```python
from apps.commons.utils import AuditLogger

# Registrar ação específica
AuditLogger.log_action(
    action='CUSTOM_ACTION',
    content_type='CustomModel',
    object_id=obj.id,
    description='Ação personalizada realizada',
    sensitivity_level='HIGH'
)
```

### **3. Registro de Acesso a Dados**
```python
from apps.commons.utils import AuditLogger

# Registrar acesso a dados de paciente
AuditLogger.log_data_access(
    patient=patient_obj,
    access_type='VIEW',
    data_fields=['nome', 'cpf', 'telefone'],
    purpose='Consulta médica agendada'
)
```

### **4. Gestão de Consentimentos**
```python
from apps.commons.utils import LGPDCompliance

# Criar consentimento
consent = LGPDCompliance.create_consent(
    patient=patient_obj,
    consent_type='DATA_PROCESSING',
    purpose='Tratamento médico e acompanhamento',
    data_categories=['dados_pessoais', 'dados_medicos'],
    consent_text='Texto completo do consentimento...'
)

# Revogar consentimento
LGPDCompliance.revoke_consent(
    consent_id=consent.id,
    reason='Solicitação do titular'
)
```

### **5. Relatórios e Análises**
```python
# Gerar relatório de portabilidade
data = LGPDCompliance.generate_data_portability_report(patient_obj)

# Verificar dados para retenção
old_records = LGPDCompliance.check_data_retention(PatientUser, 2555)

# Anonimizar dados
LGPDCompliance.anonymize_patient_data(patient_obj)
```

## 📈 Monitoramento e Alertas

### **Indicadores Implementados**
- **Taxa de cobertura** de consentimentos
- **Incidentes de segurança** por período
- **Acessos por usuário** e finalidade
- **Compliance de retenção** de dados

### **Alertas Automáticos**
- Tentativas de acesso não autorizado
- Consentimentos próximos ao vencimento
- Dados elegíveis para exclusão
- Violações de políticas de acesso

## 🔧 Configurações Avançadas

### **Personalização de Logs**
```python
# Em settings.py
LOGGING = {
    'loggers': {
        'apps.commons.audit': {
            'handlers': ['audit_file', 'console'],
            'level': 'INFO',
        },
        'apps.commons.lgpd': {
            'handlers': ['lgpd_file', 'console'],
            'level': 'INFO',
        },
    }
}
```

### **Políticas de Retenção**
```python
# Configurar períodos de retenção
AUDIT_RETENTION_DAYS = 2555  # 7 anos
ACCESS_LOG_RETENTION_DAYS = 365  # 1 ano
CONSENT_RETENTION_DAYS = 3650  # 10 anos
```

## 🎯 Próximos Passos

### **Melhorias Planejadas**
1. **Dashboard de compliance** em tempo real
2. **Alertas por email** para violações
3. **Integração com SIEM** externo
4. **Relatórios automáticos** periódicos
5. **API de compliance** para terceiros

### **Integrações Futuras**
- Sistema de backup automático
- Criptografia de logs sensíveis
- Assinatura digital de evidências
- Integração com blockchain para imutabilidade

---

## 📞 Suporte

Para dúvidas sobre o sistema de auditoria:
1. Consulte os logs no admin: `/admin/commons/`
2. Execute relatórios de compliance
3. Verifique a documentação técnica
4. Analise os logs de auditoria

**Sistema implementado com sucesso! 🎉**
**Compliance LGPD ativo e monitorando todas as operações.**