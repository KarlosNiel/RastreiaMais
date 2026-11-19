describe("Exportação de Agendamentos em PDF", () => {
  const todayIso = new Date().toISOString();
  const futureDate = new Date(Date.now() + 86400000 * 10).toISOString();

  const mockAppointments = [
    {
      id: 1,
      patient: {
        id: 101,
        cpf: "84533625401",
        sus: "700012345678901",
        phone: "83998765432",
        conditions: "DM",
        user: { first_name: "Cleilda", last_name: "Paulino dos Santos" },
      },
      professional: {
        id: 10,
        role: "Enfermeiro",
        user: { first_name: "Euzerlane", last_name: "Silva" },
      },
      scheduled_datetime: futureDate,
      local: { id: 1, name: "UBS Jardim Magnólia" },
      risk_level: "Seguro",
      type: "Retorno",
      status: "ativo",
      description: "Avaliar controle glicêmico.",
    },
    {
      id: 2,
      patient: {
        id: 102,
        cpf: "12345678900",
        phone: "83991234567",
        conditions: "HAS / DM",
        user: { first_name: "José", last_name: "Antônio Ferreira" },
      },
      professional: {
        id: 11,
        role: "Médico",
        user: { first_name: "Carlos", last_name: "Mendes" },
      },
      scheduled_datetime: todayIso,
      local: { id: 1, name: "UBS Jardim Magnólia" },
      risk_level: "Crítico",
      type: "Consulta",
      status: "ativo",
      description: "PA elevada nas últimas aferições.",
    },
  ];

  const toLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
  };

  beforeEach(() => {
    cy.mockFullAuth("PROFESSIONAL");

    cy.intercept("GET", "**/api/v1/appointments/**", {
      statusCode: 200,
      body: mockAppointments,
    }).as("getAppointments");

    cy.intercept("GET", "**/api/v1/alerts/**", {
      statusCode: 200,
      body: [],
    }).as("getAlerts");

    cy.intercept("GET", "**/api/v1/reports/kpis/**", {
      statusCode: 200,
      body: {
        total_patients: 2,
        total_appointments: 2,
        critical_appointments: 1,
        critical_alerts: 0,
      },
    }).as("getKpis");

    cy.visit("/profissional");
    cy.wait("@getAppointments");
  });

  it("exibe o botão Baixar PDF com a contagem atual e baixa o PDF diretamente", () => {
    cy.contains("h2", "Agenda de Atendimentos").should("be.visible");
    cy.get('button[aria-label^="Baixar PDF"]').should("contain.text", "2");

    // Filtra para Alto risco e valida atualização dinâmica do contador do botão PDF
    cy.contains("button", "Alto risco").click();
    cy.get('button[aria-label^="Baixar PDF"]').should("contain.text", "1");

    // Clica para baixar o PDF da visualização filtrada
    cy.get('button[aria-label^="Baixar PDF"]').click();
    cy.contains("PDF gerado com sucesso!").should("be.visible");

    const downloadsFolder = Cypress.config("downloadsFolder");
    const todayKey = toLocalDateKey(new Date());
    const expectedPath = `${downloadsFolder}/rastreia-agendamentos-agenda-${todayKey}.pdf`;

    cy.readFile(expectedPath, "binary", { timeout: 10000 }).should(
      (content) => {
        expect(content.slice(0, 5)).to.eq("%PDF-");
      },
    );
  });

  it("permite personalizar período e filtros pelo modal e baixar o PDF", () => {
    cy.get('button[aria-label="Opções de exportação em PDF"]').click();
    cy.contains("Personalizar PDF...").click();

    cy.contains("h2", "Exportar Agendamentos em PDF").should("be.visible");
    cy.contains("2 agendamentos selecionados").should("be.visible");

    // Alterna para "Hoje" e valida filtragem no preview do modal
    cy.contains("button", "Hoje").click();
    cy.contains("1 agendamento selecionado").should("be.visible");

    // Alterna para Retrato e clica em Baixar PDF dentro do modal
    cy.contains("button", "Retrato (A4)").click();
    cy.get('[role="dialog"]').contains("button", "Baixar PDF").click();

    cy.contains("PDF gerado com sucesso!").should("be.visible");

    const downloadsFolder = Cypress.config("downloadsFolder");
    const todayKey = toLocalDateKey(new Date());
    const expectedPath = `${downloadsFolder}/rastreia-agendamentos-hoje-${todayKey}.pdf`;

    cy.readFile(expectedPath, "binary", { timeout: 10000 }).should(
      (content) => {
        expect(content.slice(0, 5)).to.eq("%PDF-");
      },
    );
  });
});
