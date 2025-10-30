# Rastreia+ Backend

Sistema de gerenciamento para auxiliar APS e UBS no acompanhamento de pessoas com doenças crônicas não transmissíveis.

## 🚀 Configuração por Ambiente

Este projeto utiliza configurações separadas por ambiente para melhor organização e segurança.

### Ambientes Disponíveis

- **Development** (`development.py`) - Para desenvolvimento local
- **Production** (`production.py`) - Para ambiente de produção
- **Testing** (`testing.py`) - Para execução de testes

### 🔧 Configuração Inicial

1. **Clone o repositório e entre na pasta do backend:**
```bash
cd backend
```

2. **Crie e ative o ambiente virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 🌍 Executando em Diferentes Ambientes

#### Desenvolvimento (padrão)
```bash
python manage.py runserver
# ou explicitamente
DJANGO_ENV=development python manage.py runserver
```

#### Produção
```bash
DJANGO_ENV=production python manage.py runserver
```

#### Testes
```bash
DJANGO_ENV=testing python manage.py test
```

### 📋 Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

#### Obrigatórias para Produção:
- `SECRET_KEY` - Chave secreta do Django
- `DB_NAME` - Nome do banco de dados
- `DB_USER` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `ALLOWED_HOSTS` - Hosts permitidos (separados por vírgula)

#### Opcionais:
- `DEBUG` - Modo debug (True/False)
- `DB_HOST` - Host do banco (padrão: localhost)
- `DB_PORT` - Porta do banco (padrão: 5432)
- `EMAIL_HOST` - Servidor de email
- `REDIS_URL` - URL do Redis para cache

### 🗄️ Banco de Dados

#### Desenvolvimento
- Utiliza SQLite por padrão
- Arquivo: `db.sqlite3`

#### Produção
- Recomendado PostgreSQL
- Configure as variáveis `DB_*` no `.env`

### 📊 Comandos Úteis

```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Executar testes
python manage.py test

# Coletar arquivos estáticos (produção)
python manage.py collectstatic

# Shell do Django
python manage.py shell
```

### 📚 Documentação da API

Com o servidor rodando, acesse:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- Schema JSON: http://localhost:8000/api/schema/

### 🔒 Segurança

#### Desenvolvimento
- Debug habilitado
- CORS permissivo
- Configurações de segurança relaxadas

#### Produção
- Debug desabilitado
- HTTPS obrigatório
- Headers de segurança configurados
- CORS restritivo
- Logs de segurança

### 📝 Logs

Os logs são salvos em:
- Desenvolvimento: Console
- Produção: `/var/log/django/` (configurar permissões)
- Testes: Mínimo necessário

### 🧪 Testes

```bash
# Executar todos os testes
DJANGO_ENV=testing python manage.py test

# Executar testes com coverage
DJANGO_ENV=testing coverage run --source='.' manage.py test
coverage report
coverage html
```

### 🚀 Deploy

Para produção, certifique-se de:

1. Configurar todas as variáveis de ambiente
2. Usar PostgreSQL como banco de dados
3. Configurar Redis para cache
4. Configurar servidor web (Nginx + Gunicorn)
5. Configurar HTTPS
6. Configurar backup do banco de dados

### 📦 Estrutura do Projeto

```
backend/
├── core/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # Configurações base
│   │   ├── development.py   # Desenvolvimento
│   │   ├── production.py    # Produção
│   │   └── testing.py       # Testes
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                    # Aplicações Django
├── static/                  # Arquivos estáticos
├── media/                   # Uploads
├── templates/               # Templates
├── logs/                    # Logs
├── .env.example            # Exemplo de variáveis
├── requirements.txt        # Dependências
└── manage.py
```