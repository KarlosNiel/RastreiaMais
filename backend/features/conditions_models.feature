Feature: Gerenciamento de condições de saúde (DCNT, HAS, DM, OtherDCNT)

  Scenario: Criar DCNT para paciente
    Given existe um usuário "patient_dcnt" com email "dcnt@test.com"
    When eu criar um DCNT para esse paciente diagnosticado
    Then o DCNT deve ser criado com paciente associado e diagnosticado

  Scenario: Criar DCNT sem paciente
    When eu criar um DCNT sem paciente
    Then o DCNT deve ser criado sem paciente e não diagnosticado

  Scenario: Criar HAS com complicações
    Given existe um usuário "patient_has" com email "has@test.com"
    When eu criar um HAS para esse paciente com complicação "AVC"
    Then o HAS deve ter a complicação "AVC" associada

  Scenario: Criar DM com tratamento e comorbidades
    Given existe um usuário "patient_dm" com email "dm@test.com"
    When eu criar um DM para esse paciente com tratamento "Oral" e comorbidade "Cardiaca"
    Then o DM deve ter tratamento "Oral" e comorbidade "Cardiaca"

  Scenario: Criar OtherDCNT com nome
    Given existe um usuário "patient_other" com email "other@test.com"
    When eu criar um OtherDCNT para esse paciente com nome "Outra Condição"
    Then o OtherDCNT deve ter o nome "Outra Condição"
