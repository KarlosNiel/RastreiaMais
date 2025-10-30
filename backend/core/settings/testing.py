"""
Configurações para ambiente de testes.
"""

from .base import *

# AVISO DE SEGURANÇA: não execute com debug ativado em produção!
DEBUG = False

ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']

# Banco de dados para testes (em memória para velocidade)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Hashers de senha mais rápidos para testes
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Cache fictício para testes
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Backend de email para testes
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Desabilitar migrações para testes mais rápidos
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Logs mínimos para testes
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}

# Configurações do DRF para testes
REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [
    'rest_framework.authentication.SessionAuthentication',
]

# JWT para testes
SIMPLE_JWT.update({
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=10),
})

# Desabilitar CORS para testes
CORS_ALLOW_ALL_ORIGINS = True

# Arquivos de mídia para testes
MEDIA_ROOT = '/tmp/test_media'

# Configurações de segurança relaxadas para testes
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False