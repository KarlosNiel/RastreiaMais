describe('Recuperação de Senha', () => {
  beforeEach(() => {
    cy.visit('/auth/recuperar-senha');
  });

  it('deve exibir formulário inicial corretamente', () => {
    cy.contains('Recuperar Senha').should('be.visible');
    cy.get('input[name="identifier"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
    cy.contains('Voltar para o login').should('be.visible');
  });

  it('deve habilitar botão ao preencher campo', () => {
    cy.get('input[name="identifier"]').type('teste@exemplo.com');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('deve exibir mensagem de sucesso ao solicitar recuperação', () => {
    // Mock da API
    cy.intercept('POST', '**/api/password-reset/request/', {
      statusCode: 200,
      body: {
        message: 'Email enviado com sucesso'
      }
    }).as('resetRequest');

    cy.get('input[name="identifier"]').type('teste@exemplo.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@resetRequest');

    cy.contains('Email Enviado!').should('be.visible');
    cy.contains('Se o email informado estiver cadastrado').should('be.visible');
    cy.contains('Voltar para o login').should('be.visible');
  });

  it('deve exibir erro quando API falhar', () => {
    // Mock da API com erro
    cy.intercept('POST', '**/api/password-reset/request/', {
      statusCode: 400,
      body: {
        message: 'Usuário não encontrado'
      }
    }).as('resetRequestError');

    cy.get('input[name="identifier"]').type('inexistente@exemplo.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@resetRequestError');

    cy.get('[role="alert"]').should('contain', 'Usuário não encontrado');
    cy.contains('Email Enviado!').should('not.exist');
  });
});
