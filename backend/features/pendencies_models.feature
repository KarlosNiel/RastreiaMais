Feature: Comportamento do modelo Pendency

  Background:
    Given existe um paciente chamado "Test User"
    And existe uma microárea chamada "MicroArea 1"

  Scenario: Criar pendência com microárea
    When crio uma pendência para o paciente "Test User" com a microárea "MicroArea 1"
    Then a pendência deve estar associada ao paciente "Test User"
    And a pendência deve estar associada à microárea "MicroArea 1"

  Scenario: Criar pendência sem microárea
    When crio uma pendência para o paciente "Test User" sem microárea
    Then a pendência deve estar associada ao paciente "Test User"
    And a pendência não deve ter microárea

  Scenario: Paciente obrigatório
    When tento criar uma pendência sem paciente
    Then deve ser levantado um IntegrityError de pendencies
