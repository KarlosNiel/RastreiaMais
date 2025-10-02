Feature: Comportamento do modelo Appointment

  Background:
    Given existe um paciente chamado "Paciente Teste" em appoitments
    And existe um profissional chamado "Profissional Teste" com função "Enfermeiro" em appoitments
    And existe uma instituição chamada "Clínica Teste"

  Scenario: Criar consulta com todos os campos
    When crio uma consulta para o paciente "Paciente Teste" com o profissional "Profissional Teste" na instituição "Clínica Teste"
    Then a consulta deve estar associada ao paciente "Paciente Teste"
    And a consulta deve estar associada ao profissional "Profissional Teste"
    And a consulta deve estar na instituição "Clínica Teste"
    And a consulta deve ter risco "Moderado"
    And a consulta deve ser do tipo "Consulta"
    And a consulta deve ter status "Agendado"
    And a descrição da consulta deve ser "Consulta de rotina"

  Scenario: Criar consulta sem campos opcionais
    When crio uma consulta para o paciente "Paciente Teste" com o profissional "Profissional Teste" sem instituição
    Then a consulta deve estar associada ao paciente "Paciente Teste"
    And a consulta não deve ter instituição
    And a consulta deve ter risco "Seguro"
    And a consulta deve ser do tipo "Exame"

  Scenario: Tentativa de criar consulta sem paciente ou profissional
    When tento criar uma consulta sem paciente ou profissional
    Then deve ser levantado um IntegrityError de appointment
