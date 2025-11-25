# RastreiaMais

RastreiaMais é uma plataforma completa de gestão em saúde projetada para otimizar agendamentos médicos, prontuários de pacientes e fluxos de trabalho clínicos.

## Visão Geral

Esta aplicação oferece uma solução completa para instituições de saúde gerenciarem informações de pacientes, agendarem consultas, acompanharem medicações, monitorarem condições médicas e gerarem relatórios. O sistema é construído com uma stack tecnológica moderna que garante escalabilidade, performance e manutenibilidade.

## Arquitetura

O projeto segue uma arquitetura full-stack com clara separação de responsabilidades:

- **Frontend**: Aplicação web moderna construída com Next.js e React
- **Backend**: API RESTful desenvolvida com Django e Python
- **Banco de Dados**: SQLite para desenvolvimento (configurável para bancos de produção)

## Stack Tecnológica

### Frontend
- Next.js 14 (App Router)
- TypeScript
- HeroUI v2 (Biblioteca de Componentes)
- Tailwind CSS
- Framer Motion
- Cypress (Testes E2E)

### Backend
- Python
- Django
- Django REST Framework
- SQLite

## Estrutura do Projeto

```
rastreiamais/
├── frontend/          # Aplicação Next.js
│   ├── app/          # Rotas e páginas da aplicação
│   ├── components/   # Componentes reutilizáveis
│   ├── services/     # Camada de integração com API
│   ├── hooks/        # Hooks customizados do React
│   └── types/        # Definições de tipos TypeScript
│
└── backend/          # Aplicação Django
    ├── accounts/     # Gerenciamento de usuários
    ├── appointments/ # Agendamento de consultas
    ├── medications/  # Rastreamento de medicações
    ├── conditions/   # Condições médicas
    ├── reports/      # Geração de relatórios
    └── manage.py     # Script de gerenciamento Django
```

## Começando

### Pré-requisitos

- Node.js 18+ e npm
- Python 3.8+
- pip (gerenciador de pacotes Python)

### Configuração do Frontend

1. Navegue até o diretório frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação frontend estará disponível em `http://localhost:3000`

### Configuração do Backend

1. Navegue até o diretório backend:
```bash
cd backend
```

2. Crie e ative um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute as migrações do banco de dados:
```bash
python manage.py migrate
```

5. Inicie o servidor de desenvolvimento:
```bash
python manage.py runserver
```

A API backend estará disponível em `http://localhost:8000`

## Desenvolvimento

### Executando Testes

Testes do frontend:
```bash
cd frontend
npm run test
```

Testes end-to-end:
```bash
cd frontend
npm run cypress:open
```

### Qualidade de Código

O projeto utiliza ESLint para análise de código. Execute o linter:
```bash
cd frontend
npm run lint
```

## Documentação da API

Os endpoints e documentação da API podem ser acessados através da collection Insomnia/Postman incluída no repositório:
- `rastreia+_insomnia-postman_Collection.json`

## Contribuindo

Por favor, siga o estilo de código estabelecido e garanta que todos os testes passem antes de submeter pull requests.

## Licença

Licenciado sob a licença MIT.