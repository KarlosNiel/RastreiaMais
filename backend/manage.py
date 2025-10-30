#!/usr/bin/env python
"""Utilitário de linha de comando do Django para tarefas administrativas."""
import os
import sys


def main():
    """Executa tarefas administrativas."""
    # Determina o ambiente baseado na variável DJANGO_ENV
    environment = os.environ.get('DJANGO_ENV', 'development')
    
    if environment == 'production':
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')
    elif environment == 'testing':
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.testing')
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Não foi possível importar o Django. Tem certeza de que está instalado e "
            "disponível na variável de ambiente PYTHONPATH? Você esqueceu de "
            "ativar um ambiente virtual?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()