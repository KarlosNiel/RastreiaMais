"""
Configurações para ambiente de desenvolvimento.
"""

from .base import *
from decouple import config

# AVISO DE SEGURANÇA: não execute com debug ativado em produção!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Banco de dados para desenvolvimento
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configurações de CORS para desenvolvimento
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

CORS_ALLOW_CREDENTIALS = True

# Cache para desenvolvimento (cache fictício)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Backend de email para desenvolvimento
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    
    # Configuração do Debug Toolbar
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
    }
    
    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]

# Django Extensions
INSTALLED_APPS += ['django_extensions']

# Logs mais verbosos para desenvolvimento
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['apps']['level'] = 'DEBUG'

# Configurações específicas do DRF para desenvolvimento
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] += [
    'rest_framework.renderers.BrowsableAPIRenderer',
]

# JWT mais permissivo para desenvolvimento
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(hours=24)  # Token dura mais tempo em dev

# Configurações de segurança relaxadas para desenvolvimento
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# Configurações do Spectacular para desenvolvimento
SPECTACULAR_SETTINGS.update({
    'SERVE_INCLUDE_SCHEMA': True,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
    },
})