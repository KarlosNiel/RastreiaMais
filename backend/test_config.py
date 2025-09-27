"""
Configurações e utilitários para testes
"""
import os
import django
from django.conf import settings
from django.test.utils import get_runner

# Configuração para testes
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Configurações específicas para testes
TEST_SETTINGS = {
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
    'CACHES': {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    },
    'LOGGING': {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'WARNING',
            },
        },
    },
}


class TestConfig:
    """Configuração centralizada para testes"""
    
    @staticmethod
    def setup_test_environment():
        """Configura ambiente de teste"""
        # Configurações específicas para testes
        for key, value in TEST_SETTINGS.items():
            setattr(settings, key, value)
    
    @staticmethod
    def run_tests():
        """Executa todos os testes"""
        TestRunner = get_runner(settings)
        test_runner = TestRunner()
        failures = test_runner.run_tests(["accounts", "medications", "appointments"])
        return failures


if __name__ == '__main__':
    TestConfig.setup_test_environment()
    failures = TestConfig.run_tests()
    if failures:
        exit(1)
