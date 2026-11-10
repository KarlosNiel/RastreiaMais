"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import logging
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()

if 'RENDER' in os.environ:
    try:
        from django.core.management import call_command
        call_command('migrate', interactive=False)
        call_command('setup_euzerlane', keep_patients=True)
    except Exception as exc:
        logging.getLogger(__name__).warning("WSGI startup migration/setup warning: %s", exc)
