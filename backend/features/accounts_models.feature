Feature: Testes para os modelos de usuário (Patient, Professional, Manager)

  Background:
    Given um usuário base chamado "Carlos Daniel Lucena da Silva" com username "patient_test" e email "patient@test.com"

  Scenario: Criar um PatientUser
    When eu crio um PatientUser para o usuário "patient_test"
    Then o PatientUser deve ser criado com sucesso

  Scenario: Método __str__ de PatientUser com nome completo
    When eu crio um PatientUser para o usuário "patient_test"
    Then a string de representação deve ser "Patient: Carlos Daniel Lucena da Silva"

  Scenario: Método __str__ de PatientUser sem nome completo
    Given um usuário base chamado " " com username "no_name" e email "no_name@test.com"
    When eu crio um PatientUser para o usuário "no_name"
    Then a string de representação deve ser "Patient: "

  Scenario: Constraint de relacionamento OneToOne em PatientUser
    When eu crio um PatientUser para o usuário "patient_test"
    And eu tento criar outro PatientUser para o mesmo usuário "patient_test"
    Then deve ocorrer um erro de integridade

  Scenario: Soft delete de PatientUser
    When eu crio um PatientUser para o usuário "patient_test"
    And eu deleto esse PatientUser
    Then ele deve estar marcado como deletado

  Scenario: Restore de PatientUser
    When eu crio um PatientUser para o usuário "patient_test"
    And eu deleto esse PatientUser
    And eu restauro esse PatientUser
    Then ele deve estar ativo novamente

  Scenario: Criar um ProfessionalUser
    Given um usuário base chamado "Dr. João Silva" com username "professional_test" e email "professional@test.com"
    When eu crio um ProfessionalUser com role "Odontologista"
    Then o ProfessionalUser deve ser criado com sucesso e ter role "Odontologista"

  Scenario: Validar choices do campo role em ProfessionalUser
    Given um usuário base chamado "Dr. João Silva" com username "professional_test" e email "professional@test.com"
    When eu tento criar um ProfessionalUser com role "Invalid Role"
    Then deve ocorrer um erro de validação

  Scenario: Criar um ManagerUser
    Given um usuário base chamado "Manager User" com username "manager_test" e email "manager@test.com"
    When eu crio um ManagerUser com telefone "11999999999"
    Then o ManagerUser deve ser criado com sucesso
