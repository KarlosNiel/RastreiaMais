from django.test import TestCase
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser
from apps.locations.models import MicroArea, Address
from apps.pendencies.models import Pendency
from django.db.utils import IntegrityError

class PendencyModelTest(TestCase):

    def setUp(self):
        # Criar usuário e paciente
        self.user = User.objects.create_user(
            username="testuser",
            password="password123",
            first_name="Test",
            last_name="User"
        )
        self.patient = PatientUser.objects.create(user=self.user)

        # Criar endereço válido
        self.address = Address.objects.create(
            uf="PB",
            city="Patos",
            district="Centro",
            street="Rua Teste",
            number=123,
            complement="Bloco A",
            zipcode="58000-000"
        )

        # Criar MicroArea
        self.micro_area = MicroArea.objects.create(
            name="MicroArea 1",
            maps_localization="https://maps.example.com/1",
            address=self.address
        )

    def test_create_pendency_with_micro_area(self):
        pendency = Pendency.objects.create(
            patient=self.patient,
            micro_area=self.micro_area
        )
        self.assertEqual(pendency.patient, self.patient)
        self.assertEqual(pendency.micro_area, self.micro_area)

    def test_create_pendency_without_micro_area(self):
        pendency = Pendency.objects.create(
            patient=self.patient,
            micro_area=None
        )
        self.assertEqual(pendency.patient, self.patient)
        self.assertIsNone(pendency.micro_area)

    def test_foreignkey_patient_required(self):
        with self.assertRaises(IntegrityError):
            Pendency.objects.create(
                patient=None,
                micro_area=self.micro_area
            )

    def test_str_representation(self):
        pendency = Pendency.objects.create(
            patient=self.patient,
            micro_area=self.micro_area
        )
        # Se desejar, implemente __str__ no Pendency para usar este teste
        self.assertIn(str(self.patient.user.get_full_name()), str(pendency))
