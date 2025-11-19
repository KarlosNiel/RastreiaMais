/// <reference types="cypress" />

// ***********************************************
// Comandos customizados para facilitar os testes
// ***********************************************

/**
 * Faz login como paciente
 */
Cypress.Commands.add('loginPaciente', (email: string, password: string) => {
  cy.visit('/auth/login/paciente');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Faz login como profissional
 */
Cypress.Commands.add('loginProfissional', (email: string, password: string) => {
  cy.visit('/auth/login/profissional');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Intercepta chamadas de API para simular respostas de sucesso
 */
Cypress.Commands.add('mockLoginSuccess', (role: 'PATIENT' | 'PROFESSIONAL' | 'MANAGER') => {
  // Mock do endpoint de login (POST /api/token/)
  cy.intercept('POST', '**/api/token/', {
    statusCode: 200,
    body: {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    },
  }).as('loginRequest');

  // Mock do endpoint /api/auth/me (chamado após login)
  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: {
      user: {
        id: 1,
        username: 'teste',
        email: 'teste@exemplo.com',
        first_name: 'Teste',
        last_name: 'Usuario',
      },
      roles: [role],
    },
  }).as('meRequest');

  // Mock do refresh token (para evitar 401)
  cy.intercept('POST', '**/api/token/refresh/', {
    statusCode: 200,
    body: {
      access: 'mock-access-token-refreshed',
    },
  }).as('refreshRequest');

  // Mock de endpoints comuns que podem ser chamados após login
  // Appointments
  cy.intercept('GET', '**/api/v1/appointments/**', {
    statusCode: 200,
    body: {
      count: 0,
      next: null,
      previous: null,
      results: [],
    },
  }).as('appointmentsRequest');

  // Outros endpoints podem ser adicionados conforme necessário
  cy.intercept('GET', '**/api/**', {
    statusCode: 200,
    body: {
      count: 0,
      results: [],
    },
  }).as('genericApiRequest');
});

/**
 * Intercepta chamadas de API para simular erro
 */
Cypress.Commands.add('mockLoginError', (message: string = 'Credenciais inválidas') => {
  cy.intercept('POST', '**/api/token/', {
    statusCode: 401,
    body: {
      detail: message,
    },
  }).as('loginRequest');
});

/**
 * Mock completo de autenticação - intercepta todas as requisições necessárias
 * para evitar erros 401 após login
 */
Cypress.Commands.add('mockFullAuth', (role: 'PATIENT' | 'PROFESSIONAL' | 'MANAGER') => {
  // Ordem importa! Interceptors mais genéricos primeiro, específicos depois
  
  // 1. Intercepta qualquer requisição genérica (fallback)
  cy.intercept('GET', '**/api/**', { statusCode: 200, body: { results: [] } });
  cy.intercept('POST', '**/api/**', { statusCode: 200, body: {} });
  cy.intercept('PUT', '**/api/**', { statusCode: 200, body: {} });
  cy.intercept('PATCH', '**/api/**', { statusCode: 200, body: {} });
  cy.intercept('DELETE', '**/api/**', { statusCode: 204, body: {} });

  // 2. Interceptors específicos (sobrescrevem os genéricos)
  cy.intercept('POST', '**/api/token/', {
    statusCode: 200,
    body: { access: 'mock-token', refresh: 'mock-refresh' },
  }).as('loginToken');

  cy.intercept('POST', '**/api/token/refresh/', {
    statusCode: 200,
    body: { access: 'mock-token-refreshed' },
  }).as('refreshToken');

  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: {
      user: { id: 1, username: 'teste', email: 'teste@exemplo.com' },
      roles: [role],
    },
  }).as('authMe');

  // 3. Seta tokens no localStorage para simular login
  cy.window().then((win) => {
    win.localStorage.setItem('access', 'mock-token');
    win.localStorage.setItem('refresh', 'mock-refresh');
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginPaciente(email: string, password: string): Chainable<void>;
      loginProfissional(email: string, password: string): Chainable<void>;
      mockLoginSuccess(role: 'PATIENT' | 'PROFESSIONAL' | 'MANAGER'): Chainable<void>;
      mockLoginError(message?: string): Chainable<void>;
      mockFullAuth(role: 'PATIENT' | 'PROFESSIONAL' | 'MANAGER'): Chainable<void>;
    }
  }
}

export {};
