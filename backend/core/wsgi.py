"""
Configuração WSGI para o projeto core.

Expõe o callable WSGI como uma variável de nível de módulo chamada ``application``.

Para mais informações sobre este arquivo, veja
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Determina o ambiente baseado na variável DJANGO_ENV
environment = os.environ.get('DJANGO_ENV', 'production')

if environment == 'development':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
elif environment == 'testing':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.testing')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')

application = get_wsgi_application()
