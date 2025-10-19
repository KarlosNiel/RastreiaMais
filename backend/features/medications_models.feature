Feature: Comportamento do modelo Medication

  Background:
    Given que exista um paciente

  Scenario: Medicação com end_date no futuro está ativa
    When crio uma medicação com end_date em 5 dias
    Then a medicação deve estar ativa

  Scenario: Medicação com end_date no passado está inativa
    When crio uma medicação com end_date há 5 dias
    Then a medicação não deve estar ativa

  Scenario: Finished marca medicação expirada como deletada
    When crio uma medicação com end_date há 1 dias
    And finalizo a medicação
    Then a medicação deve estar deletada

  Scenario: Finished não marca medicação ativa como deletada
    When crio uma medicação com end_date em 5 dias
    And finalizo a medicação
    Then a medicação não deve estar deletada
