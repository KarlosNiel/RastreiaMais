#!/usr/bin/env python
"""
Script para execução de testes do projeto RastreiaMais
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
from io import StringIO
import time

def setup_django():
    """Configura o ambiente Django para testes"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

def run_tests_by_app():
    """Executa testes por app individualmente com relatório detalhado"""
    setup_django()
    
    # Configurações específicas para testes
    test_settings = {
        'DATABASES': {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        'PASSWORD_HASHERS': [
            'django.contrib.auth.hashers.MD5PasswordHasher',
        ],
        'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    }
    
    # Aplica configurações de teste
    for key, value in test_settings.items():
        setattr(settings, key, value)
    
    # Lista de apps para testar com descrições
    apps_to_test = {
        'accounts': 'Sistema de usuários (pacientes, profissionais, managers)',
        'medications': 'Gerenciamento de medicamentos',
        'appointments': 'Sistema de consultas e agendamentos',
        'alerts': 'Sistema de alertas',
        'conditions': 'Condições de saúde (DCNT, HAS, DM)',
        'locations': 'Endereços, micro áreas e instituições',
        'pendency': 'Sistema de pendências',
        'reports': 'Sistema de relatórios',
        'commons': 'Modelos base e utilitários comuns'
    }
    
    print("=" * 80)
    print("🧪 EXECUTANDO TESTES DO RASTREIA MAIS")
    print("=" * 80)
    print()
    
    total_failures = 0
    total_tests = 0
    results = {}
    
    for app_name, description in apps_to_test.items():
        print(f"📋 Testando {app_name.upper()}")
        print(f"   {description}")
        print("-" * 60)
        
        start_time = time.time()
        
        # Executa testes para o app específico
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=1, interactive=False)
        
        # Captura a saída
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()
        
        try:
            failures = test_runner.run_tests([app_name])
        finally:
            sys.stdout = old_stdout
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Processa resultados
        output = captured_output.getvalue()
        lines = output.strip().split('\n')
        
        # Extrai informações dos resultados
        tests_run = 0
        failures_count = 0
        errors_count = 0
        
        for line in lines:
            if 'Ran' in line and 'test' in line:
                # Ex: "Ran 25 tests in 0.123s"
                parts = line.split()
                for i, part in enumerate(parts):
                    if part == 'Ran':
                        tests_run = int(parts[i + 1])
                    elif part == 'failures':
                        failures_count = int(parts[i - 1])
                    elif part == 'errors':
                        errors_count = int(parts[i - 1])
        
        total_failures += failures_count + errors_count
        total_tests += tests_run
        
        # Determina status
        if failures_count == 0 and errors_count == 0:
            status = "✅ PASSOU"
            status_color = "\033[92m"  # Verde
        else:
            status = "❌ FALHOU"
            status_color = "\033[91m"  # Vermelho
        
        # Exibe resultado
        print(f"{status_color}{status}\033[0m - {tests_run} testes executados")
        if failures_count > 0:
            print(f"   {failures_count} falhas encontradas")
        if errors_count > 0:
            print(f"   {errors_count} erros encontrados")
        print(f"   ⏱️  Tempo: {duration:.2f}s")
        
        results[app_name] = {
            'status': 'PASSOU' if (failures_count == 0 and errors_count == 0) else 'FALHOU',
            'tests_run': tests_run,
            'failures': failures_count,
            'errors': errors_count,
            'duration': duration,
            'output': output
        }
        
        print()
    
    # Relatório final
    print("=" * 80)
    print("📊 RELATÓRIO FINAL DOS TESTES")
    print("=" * 80)
    print()
    
    passed_apps = sum(1 for r in results.values() if r['status'] == 'PASSOU')
    failed_apps = sum(1 for r in results.values() if r['status'] == 'FALHOU')
    
    print(f"✅ Apps que passaram nos testes: {passed_apps}/{len(apps_to_test)}")
    print(f"❌ Apps com falhas: {failed_apps}/{len(apps_to_test)}")
    print(f"🧪 Total de testes executados: {total_tests}")
    print(f"💥 Total de falhas: {total_failures}")
    print()
    
    if failed_apps > 0:
        print("📋 DETALHES DAS FALHAS:")
        print("-" * 40)
        for app_name, result in results.items():
            if result['status'] == 'FALHOU':
                print(f"❌ {app_name.upper()}:")
                print(f"   - Testes: {result['tests_run']}")
                print(f"   - Falhas: {result['failures']}")
                print(f"   - Erros: {result['errors']}")
                print()
    
    print("=" * 80)
    if total_failures == 0:
        print("🎉 TODOS OS TESTES PASSARAM COM SUCESSO!")
        print("=" * 80)
        return 0
    else:
        print(f"⚠️  {total_failures} TESTES FALHARAM")
        print("=" * 80)
        return 1

def run_tests():
    """Executa todos os testes do projeto (versão simplificada)"""
    setup_django()
    
    # Configurações específicas para testes
    test_settings = {
        'DATABASES': {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        'PASSWORD_HASHERS': [
            'django.contrib.auth.hashers.MD5PasswordHasher',
        ],
        'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    }
    
    # Aplica configurações de teste
    for key, value in test_settings.items():
        setattr(settings, key, value)
    
    # Executa testes
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True)
    
    # Lista de apps para testar
    apps_to_test = [
        'accounts',
        'medications', 
        'appointments',
        'alerts',
        'conditions',
        'locations',
        'pendency',
        'reports',
        'commons'
    ]
    
    failures = test_runner.run_tests(apps_to_test)
    return failures

def run_specific_tests(test_pattern=None):
    """Executa testes específicos baseado em padrão"""
    setup_django()
    
    if test_pattern:
        # Executa testes específicos
        os.system(f'python manage.py test {test_pattern}')
    else:
        # Executa todos os testes
        failures = run_tests()
        return failures

def run_with_coverage():
    """Executa testes com cobertura de código"""
    setup_django()
    
    # Comando para executar com coverage
    cmd = """
    coverage run --source='.' manage.py test
    coverage report
    coverage html
    """
    
    os.system(cmd)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--coverage':
            run_with_coverage()
        elif sys.argv[1] == '--detailed':
            failures = run_tests_by_app()
            sys.exit(failures)
        else:
            run_specific_tests(sys.argv[1])
    else:
        failures = run_tests_by_app()
        sys.exit(failures)
