Feature: Testes para o modelo Alert
  Testes de criação, __str__, validação de risco e soft delete.

  Background:
    Given um alerta Alert base com título "Alerta de Teste" e descrição "Descrição do alerta de teste."

  Scenario: Criar um Alert com risco padrão
    When eu crio o alerta Alert
    Then o Alert deve ser criado com sucesso
    And o nível de risco do Alert deve ser "Moderado"

  Scenario: Criar um Alert com risco específico
    When eu crio o alerta Alert com risco "Crítico"
    Then o Alert deve ser criado com sucesso
    And o nível de risco do Alert deve ser "Crítico"

  Scenario: Método __str__ do Alert
    When eu crio o alerta Alert com risco "Seguro"
    Then a string de representação do Alert deve ser "[Seguro] Alerta de Teste"

  Scenario: Validação de risco inválido
    When eu tento criar o alerta Alert com risco inválido "Inexistente"
    Then deve ocorrer um erro de validação no Alert

  Scenario: Soft delete de Alert
    When eu crio o alerta Alert
    And eu deleto o alerta Alert
    Then ele deve estar marcado como deletado no Alert
