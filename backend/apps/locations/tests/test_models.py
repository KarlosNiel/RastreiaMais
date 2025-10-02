# apps/locations/tests/test_models.py
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.locations.models import Address, MicroArea, Institution

class AddressModelTest(TestCase):
    def test_str_method(self):
        address = Address.objects.create(
            uf="PB",
            city="Patos",
            district="Centro",
            street="Rua Teste",
            number=123,
            zipcode="58800-000"
        )
        self.assertEqual(str(address), "Rua Teste, 123 - Centro, Patos/PB")

    def test_valid_zipcode(self):
        address = Address(
            uf="PB",
            city="Patos",
            district="Centro",
            street="Rua Teste",
            number=123,
            zipcode="58800-000"
        )
        # Não deve levantar erro
        address.full_clean()

    def test_invalid_zipcode_raises_validation_error(self):
        address = Address(
            uf="PB",
            city="Patos",
            district="Centro",
            street="Rua Teste",
            number=123,
            zipcode="5880-000"
        )
        with self.assertRaises(ValidationError):
            address.full_clean()


class MicroAreaModelTest(TestCase):
    def setUp(self):
        self.address = Address.objects.create(
            uf="PB",
            city="Patos",
            district="Centro",
            street="Rua Teste",
            number=123,
            zipcode="58800-000"
        )

    def test_str_method(self):
        micro_area = MicroArea.objects.create(name="Área 1", address=self.address)
        self.assertEqual(str(micro_area), "Área 1")


class InstitutionModelTest(TestCase):
    def setUp(self):
        self.address = Address.objects.create(
            uf="PB",
            city="Patos",
            district="Centro",
            street="Rua Teste",
            number=123,
            zipcode="58800-000"
        )

    def test_str_method(self):
        institution = Institution.objects.create(name="Clínica Teste", address=self.address)
        self.assertEqual(str(institution), "Clínica Teste")
