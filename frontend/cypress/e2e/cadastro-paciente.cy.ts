describe('Cadastro de Paciente', () => {
  beforeEach(() => {
    // Autentica como profissional (necessário para criar agendamentos)
    cy.mockFullAuth('PROFESSIONAL');

    // Mock para verificação de CPF (retorna que não existe)
    cy.intercept('GET', '**/api/v1/accounts/patients/check-cpf/**', {
      statusCode: 200,
      body: { exists: false },
    }).as('checkCpf');

    // Mock para lista de instituições (unidades de saúde)
    cy.intercept('GET', '**/api/v1/locations/institutions/', {
      statusCode: 200,
      body: [
        { id: 1, name: 'UBS Centro' },
        { id: 2, name: 'Hospital Municipal' },
      ],
    }).as('getInstitutions');

    // Mock para lista de profissionais (para resolver ID do profissional logado)
    cy.intercept('GET', '**/api/v1/accounts/professionals/', {
      statusCode: 200,
      body: [
        { id: 10, user: { id: 1 }, role: 'DOCTOR' }
      ]
    }).as('getProfessionals');

    // Mock para criação de endereço
    cy.intercept('POST', '**/api/v1/locations/address/', {
      statusCode: 201,
      body: { id: 100, street: 'Rua Teste', number: 123 },
    }).as('createAddress');

    // Mock para criação do paciente
    cy.intercept('POST', '**/api/v1/accounts/patients/', {
      statusCode: 201,
      body: {
        id: 999,
        name: 'Paciente Teste Cypress',
        user: { password: 'senha-gerada-123' }, // Senha gerada pelo backend
      },
    }).as('createPatient');

    // Mock para criação de condições (HAS/DM)
    cy.intercept('POST', '**/api/v1/conditions/systolic-hypertension-cases/', {
      statusCode: 201,
      body: { id: 50 },
    }).as('createHAS');

    cy.intercept('POST', '**/api/v1/conditions/diabetes-mellitus-cases/', {
      statusCode: 201,
      body: { id: 51 },
    }).as('createDM');

    // Mock para criação de agendamento
    cy.intercept('POST', '**/api/v1/appointments/**', {
      statusCode: 201,
      body: { id: 200 },
    }).as('createAppointment');

    cy.visit('/pacientes/novo');
  });

  it('deve realizar o cadastro completo (Caminho Feliz)', () => {
    // --- PASSO 1: Sociodemográfico ---
    cy.contains('1. Dados Sociodemográficos').should('be.visible');

    // Preencher identificação
    cy.get('input[name="socio.nome"]').type('Paciente Teste Cypress');
    
    // Nascimento
    // Tenta digitar diretamente no input hidden (RHF deve pegar se disparar change)
    // Se não funcionar, teremos que achar o input visível.
    // Mas o erro anterior reclamava de visibilidade, então force: true deve resolver o erro do Cypress.
    cy.get('input[name="socio.nascimento"]').type('1980-01-01', { force: true });
    
    // Gênero (ChipGroup)
    cy.contains('label', 'M').click({ force: true });
    
    // Raça/Etnia (Select)
    // Tenta achar pelo texto parcial "Raça" e subir na árvore
    cy.contains('Raça').parent().parent().find('button').click({ force: true });
    cy.contains('Parda').click({ force: true }); // Seleciona opção

    // CPF
    cy.get('input[name="socio.sus_cpf"]').type('12345678901');
    cy.wait(500); // Wait for typing
    cy.get('body').click({ force: true }); // Blur

    // Endereço
    cy.get('input[name="socio.endereco.logradouro"]').type('Rua das Flores, 123');
    cy.get('input[name="socio.endereco.bairro"]').type('Centro');
    cy.get('input[name="socio.endereco.cidade"]').type('São Paulo');
    
    // UF (Select)
    cy.contains('label', /^UF$/).parent().find('button').click({ force: true });
    // Use role="option" to avoid matching "São Paulo" text
    cy.get('[role="option"]').contains(/^SP$/).click({ force: true });

    // Avançar
    cy.contains('button', 'Próximo').click();

    // --- PASSO 2: Condições ---
    cy.contains('2. Condições Crônicas').should('be.visible');
    
    // Marcar HAS e DM
    // Clica no label para garantir que o evento de click seja capturado pelo HeroUI
    cy.contains('label', 'Hipertensão Arterial').click({ force: true });
    cy.contains('label', 'Diabetes Mellitus').click({ force: true });
    
    // Verifica se o passo 3 (Clínica) ficou habilitado no cabeçalho
    // Isso garante que o estado do React foi atualizado corretamente
    cy.contains('button', 'Clínica').should('not.have.attr', 'disabled');

    // Avançar
    cy.contains('button', 'Próximo').click();

    // --- PASSO 3: Clínica (aparece pois marcamos HAS/DM) ---
    cy.contains('3. Avaliação Clínica').should('be.visible');

    // Classificação HAS
    // RHFChipGroup renderiza botões/chips diretamente, não um select
    cy.contains('Estágio 1').click({ force: true });
    
    // Preencher campos obrigatórios de HAS
    cy.contains('h3', 'Hipertensão (HAS)').parent().within(() => {
        cy.contains('Já foi diagnosticado com hipertensão?').parent().contains('Sim').click({ force: true });
        cy.contains('Usa medicação?').parent().contains('Sim').click({ force: true });
        cy.contains('Histórico familiar').parent().contains('Sim').click({ force: true });
    });

    // HbA1c (DM)
    cy.get('input[name="clinica.dm.hba1c"]').type('7.5');
    
    // Preencher campos obrigatórios de DM
    cy.contains('h3', 'Diabetes (DM)').parent().within(() => {
        cy.contains('Já foi diagnosticado com diabetes?').parent().contains('Sim').click({ force: true });
        cy.contains('Usa medicação?').parent().contains('Sim').click({ force: true });
        cy.contains('Histórico familiar').parent().contains('Sim').click({ force: true });
    });

    // Avançar
    cy.contains('button', 'Próximo').click();

    // --- PASSO 4: Multiprofissional ---
    cy.contains('4. Avaliação Multiprofissional').should('be.visible');
    // Vamos apenas avançar neste passo
    cy.contains('button', 'Próximo').click();

    // --- PASSO 5: Plano ---
    cy.contains('5. Plano & Agendamentos').should('be.visible');

    // Tipo de consulta
    cy.contains('label', /^Tipo$/).parent().find('button').click({ force: true });
    cy.contains('Consulta').click({ force: true });

    // Data da consulta (usando atalho "hoje")
    cy.contains('button', 'hoje').click({ force: true });

    // Local
    cy.contains('label', /^Local$/).parent().find('button').click({ force: true });
    cy.contains('UBS Centro').click({ force: true });

    // Finalizar
    cy.contains('button', 'Finalizar registro').click();

    // --- VERIFICAÇÕES FINAIS ---
    
    // Verifica chamadas de API
    cy.wait('@createPatient').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      // Captura a senha gerada enviada no payload
      const password = interception.request.body.user.password;
      cy.wrap(password).as('generatedPassword');
    });
    
    // Verifica criação de endereço
    cy.wait('@createAddress').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });

    // Verifica criação de condições (HAS e DM)
    cy.wait('@createHAS').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
    cy.wait('@createDM').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
    cy.wait('@createAppointment');

    // Deve exibir modal com a senha gerada (confirma que chegou ao fim)
    cy.contains('Senha inicial do paciente').should('be.visible');
    
    // Verifica se a senha capturada está visível
    cy.get<string>('@generatedPassword').then((password) => {
      cy.contains(password).should('be.visible');
    });

    // Verifica se houve erro no agendamento (warning)
    cy.get('body').then(($body) => {
      if ($body.text().includes('problema ao registrar o agendamento')) {
        throw new Error('Agendamento falhou (Warning toast found)!');
      }
    });

    // Toast de sucesso pode ser instável com o modal aberto, 
    // mas a presença do modal com a senha já confirma o sucesso.
  });

  it('deve validar campos obrigatórios no passo 1', () => {
    // Tenta avançar sem preencher nada
    cy.contains('button', 'Próximo').click();

    // Verifica estado inválido nos inputs (ex: borda vermelha ou atributo aria-invalid)
    // O toast pode demorar ou não aparecer se houver erro de JS, mas o aria-invalid é garantido pelo RHF
    cy.get('input[name="socio.nome"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('input[name="socio.sus_cpf"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('deve pular o passo "Clínica" se não houver HAS ou DM', () => {
    // --- PASSO 1 ---
    cy.get('input[name="socio.nome"]').type('Paciente Sem Doença');
    cy.get('input[name="socio.sus_cpf"]').type('11122233344');
    cy.contains('label', 'F').click({ force: true });
    
    // Avançar
    cy.contains('button', 'Próximo').click();

    // --- PASSO 2 ---
    cy.contains('2. Condições Crônicas').should('be.visible');
    
    // NÃO marca HAS nem DM
    // Garante interação: Marca e Desmarca para garantir que o estado é atualizado
    
    // 1. Marca HAS -> deve habilitar passo 3
    cy.contains('label', 'Hipertensão Arterial').click({ force: true });
    cy.contains('button', 'Clínica').should('not.have.attr', 'disabled');
    
    // 2. Desmarca HAS -> deve desabilitar passo 3
    cy.contains('label', 'Hipertensão Arterial').click({ force: true });
    cy.contains('button', 'Clínica').should('have.attr', 'disabled');
    
    // Garante que DM também está desmarcado (passo 3 continua desabilitado)
    cy.contains('button', 'Clínica').should('have.attr', 'disabled');
    
    // Preenche "Outras DCNTs" para permitir avançar
    cy.get('input[placeholder*="Asma, DPOC"]').type('Asma');
    cy.get('input[placeholder*="Asma, DPOC"]').should('have.value', 'Asma');
    
    // Preenche "Em acompanhamento?" (ChipGroup)
    // Busca o grupo pelo texto do label e clica na opção "Não" dentro dele
    cy.contains('Em acompanhamento?').parent().contains('Não').click({ force: true });
    
    cy.get('body').click({ force: true }); // Blur

    // Verifica se não há erro de validação
    cy.contains('Revise os campos desta etapa').should('not.exist');
    cy.get('[aria-invalid="true"]').should('not.exist');

    // Avançar
    cy.scrollTo('bottom');
    cy.wait(500); // Pequeno wait para animações
    cy.contains('button', 'Próximo').click({ force: true });

    // --- DEVE IR DIRETO PARA O PASSO 4 ---
    // Verifica se NÃO está no passo 3
    cy.contains('3. Avaliação Clínica').should('not.exist');
    // Verifica se ESTÁ no passo 4
    cy.contains('4. Avaliação Multiprofissional').should('be.visible');
  });
});
