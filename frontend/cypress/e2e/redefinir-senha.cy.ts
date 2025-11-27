describe('Redefinição de Senha', () => {
  const validToken = 'valid-token-123';
  const invalidToken = 'invalid-token-456';

  it('deve mostrar erro com token inválido', () => {
    // Mock da validação de token (inválido)
    cy.intercept('POST', '**/api/password-reset/validate/', {
      statusCode: 200,
      body: {
        valid: false,
        message: 'Token inválido ou expirado.'
      }
    }).as('validateTokenInvalid');

    cy.visit(`/auth/redefinir-senha?token=${invalidToken}`);
    
    cy.wait('@validateTokenInvalid');

    cy.contains('Link Inválido').should('be.visible');
    cy.contains('Solicitar novo link').should('be.visible');
  });

  it('deve mostrar formulário com token válido', () => {
    // Mock da validação de token (válido)
    cy.intercept('POST', '**/api/password-reset/validate/', {
      statusCode: 200,
      body: {
        valid: true,
        email: 'usuario@teste.com'
      }
    }).as('validateTokenValid');

    cy.visit(`/auth/redefinir-senha?token=${validToken}`);
    
    cy.wait('@validateTokenValid');

    cy.contains('Redefinir Senha').should('be.visible');
    cy.contains('Redefinindo senha para:').should('be.visible');
    cy.contains('usuario@teste.com').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="password_confirm"]').should('be.visible');
  });

  it('deve validar senhas não coincidentes', () => {
    cy.intercept('POST', '**/api/password-reset/validate/', {
      statusCode: 200,
      body: { valid: true, email: 'usuario@teste.com' }
    }).as('validateToken');

    cy.visit(`/auth/redefinir-senha?token=${validToken}`);
    cy.wait('@validateToken');

    cy.get('input[name="password"]').type('Senha123!');
    cy.get('input[name="password_confirm"]').type('SenhaDiferente');
    
    // Clica fora para disparar validação (blur)
    cy.get('body').click();

    cy.contains('As senhas não coincidem').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('deve redefinir senha com sucesso', () => {
    cy.intercept('POST', '**/api/password-reset/validate/', {
      statusCode: 200,
      body: { valid: true, email: 'usuario@teste.com' }
    }).as('validateToken');

    cy.intercept('POST', '**/api/password-reset/confirm/', {
      statusCode: 200,
      body: { message: 'Senha alterada com sucesso' }
    }).as('confirmReset');

    cy.visit(`/auth/redefinir-senha?token=${validToken}`);
    cy.wait('@validateToken');

    const newPassword = 'NovaSenha123!';
    cy.get('input[name="password"]').type(newPassword);
    cy.get('input[name="password_confirm"]').type(newPassword);
    cy.get('body').click();

    cy.contains('As senhas coincidem').should('be.visible');
    cy.get('button[type="submit"]').should('not.be.disabled');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@confirmReset');

    cy.contains('Senha Alterada!').should('be.visible');
    cy.contains('Ir para o login agora').should('be.visible');
  });
});
