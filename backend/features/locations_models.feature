Feature: Testes para os modelos de localização
  Testes de criação, validação de CEP e métodos __str__.

  Background:
    Given um endereço base com UF "PB", cidade "Patos", distrito "Centro", rua "Rua Teste" e número 123

  # Address
  Scenario: Testar método __str__ do Address
    Then a string de representação do endereço deve ser "Rua Teste, 123 - Centro, Patos/PB"

  Scenario: Validar CEP válido
    When eu defino o CEP como "58800-000"
    Then a validação do endereço deve passar

  Scenario: Validar CEP inválido
    When eu defino o CEP como "5880-000"
    Then deve ocorrer um erro de validação no endereço

  # Institution
  Scenario: Testar método __str__ do Institution
    When eu crio uma Institution chamada "Clínica Teste"
    Then a string de representação da Institution deve ser "Clínica Teste"

  # MicroArea
  Scenario: Testar método __str__ do MicroArea
    When eu crio uma MicroArea chamada "Área 1"
    Then a string de representação da MicroArea deve ser "Área 1"
