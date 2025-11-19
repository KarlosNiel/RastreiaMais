describe('Login Completo com Mock', () => {
  describe('Login de Paciente - Fluxo Completo', () => {
    it('deve fazer login e acessar dashboard do paciente', () => {
      // Mock completo para evitar erros 401
      cy.mockFullAuth('PATIENT');
      
      cy.visit('/auth/login/paciente');
      
      cy.get('input[name="email"]').type('paciente@teste.com');
      cy.get('input[name="password"]').type('senha123');
      cy.get('button[type="submit"]').click();
      
      // Aguarda login e seta cookie
      cy.wait('@loginToken').then(() => {
        cy.setCookie('role', 'PATIENT', { path: '/', sameSite: 'lax' });
      });
      cy.wait('@authMe');
      
      // Verifica redirecionamento para /me
      cy.url({ timeout: 10000 }).should('include', '/me');
      
      // Aguarda a página carregar
      cy.wait(1000);
      
      // Verifica que não voltou para login
      cy.url().should('not.include', '/auth/login');
    });

    it('deve mostrar erro com credenciais inválidas', () => {
      cy.mockLoginError('E-mail ou senha incorretos');
      
      cy.visit('/auth/login/paciente');
      
      cy.get('input[name="email"]').type('paciente@invalido.com');
      cy.get('input[name="password"]').type('senhaerrada');
      cy.get('button[type="submit"]').click();
      
      // Verifica mensagem de erro
      cy.contains('E-mail ou senha incorretos', { timeout: 5000 }).should('be.visible');
      
      // Verifica que permaneceu na página de login
      cy.url().should('include', '/auth/login/paciente');
    });

    it('deve validar campo de email vazio', () => {
      cy.visit('/auth/login/paciente');
      
      // Tenta submeter sem preencher
      cy.get('button[type="submit"]').click();
      
      // Verifica mensagem de validação
      cy.contains('Informe o e-mail').should('be.visible');
    });

    it('deve validar campo de senha vazio', () => {
      cy.visit('/auth/login/paciente');
      
      cy.get('input[name="email"]').type('paciente@teste.com');
      cy.get('button[type="submit"]').click();
      
      // Verifica mensagem de validação
      cy.contains('Informe sua senha').should('be.visible');
    });
  });

  describe('Login de Profissional - Fluxo Completo', () => {
    it('deve fazer login como gestor e acessar dashboard', () => {
      cy.mockFullAuth('MANAGER');
      
      cy.visit('/auth/login/profissional');
      
      cy.get('input[name="email"]').type('gestor@teste.com');
      cy.get('input[name="password"]').type('senha123');
      cy.get('button[type="submit"]').click();
      
      // Aguarda login e seta cookie
      cy.wait('@loginToken').then(() => {
        cy.setCookie('role', 'MANAGER', { path: '/', sameSite: 'lax' });
      });
      cy.wait('@authMe');
      
      // Verifica redirecionamento para /gestor
      cy.url({ timeout: 10000 }).should('include', '/gestor');
      cy.wait(1000);
      cy.url().should('not.include', '/auth/login');
    });

    it('deve fazer login como profissional e acessar dashboard', () => {
      cy.mockFullAuth('PROFESSIONAL');
      
      cy.visit('/auth/login/profissional');
      
      cy.get('input[name="email"]').type('profissional@teste.com');
      cy.get('input[name="password"]').type('senha123');
      cy.get('button[type="submit"]').click();
      
      // Aguarda login e seta cookie
      cy.wait('@loginToken').then(() => {
        cy.setCookie('role', 'PROFESSIONAL', { path: '/', sameSite: 'lax' });
      });
      cy.wait('@authMe');
      
      // Verifica redirecionamento para /profissional
      cy.url({ timeout: 10000 }).should('include', '/profissional');
      cy.wait(1000);
      cy.url().should('not.include', '/auth/login');
    });

    it('deve permitir alternar visibilidade da senha', () => {
      cy.visit('/auth/login/profissional');
      
      const senha = 'minhaSenha123';
      cy.get('input[name="password"]').type(senha);
      
      // Verifica que está oculta
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Clica para mostrar
      cy.get('button[aria-label*="senha"]').first().click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      cy.get('input[name="password"]').should('have.value', senha);
      
      // Clica para ocultar novamente
      cy.get('button[aria-label*="senha"]').first().click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('deve desabilitar botão quando campos estão vazios', () => {
      cy.visit('/auth/login/profissional');
      
      // Botão deve estar desabilitado inicialmente
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Preenche email
      cy.get('input[name="email"]').type('teste@email.com');
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Preenche senha
      cy.get('input[name="password"]').type('senha123');
      cy.get('button[type="submit"]').should('not.be.disabled');
      
      // Limpa campos
      cy.get('input[name="email"]').clear();
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Funcionalidades Comuns', () => {
    it('deve manter checkbox "Lembrar-me" marcado por padrão', () => {
      cy.visit('/auth/login/paciente');
      cy.get('input[type="checkbox"]').should('be.checked');
    });

    it('deve permitir desmarcar "Lembrar-me"', () => {
      cy.visit('/auth/login/paciente');
      cy.get('input[type="checkbox"]').uncheck().should('not.be.checked');
    });

    it('deve mostrar loading ao submeter formulário', () => {
      cy.mockFullAuth('PATIENT');
      
      cy.visit('/auth/login/paciente');
      
      cy.get('input[name="email"]').type('paciente@teste.com');
      cy.get('input[name="password"]').type('senha123');
      
      // Intercepta para adicionar delay
      cy.intercept('POST', '**/api/token/', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: { access: 'token', refresh: 'refresh' },
        });
      });
      
      cy.get('button[type="submit"]').click();
      
      // Verifica que o botão está desabilitado durante o loading
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });
});
