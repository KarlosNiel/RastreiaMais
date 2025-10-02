from django.contrib.auth.models import User
from apps.accounts.models import PatientUser
from apps.conditions.models import DCNT, HAS, DM, OtherDCNT
from django.test import TestCase

class DCNTModelTest(TestCase):
    def setUp(self):
        # Primeiro cria um User
        self.user = User.objects.create_user(username="patient1", email="p1@test.com", password="123456")
        # Depois cria o PatientUser
        self.patient = PatientUser.objects.create(user=self.user)

    def test_dcnt_creation(self):
        dcnt = DCNT.objects.create(patient=self.patient, is_diagnosed=True)
        self.assertTrue(dcnt.is_diagnosed)
        self.assertEqual(dcnt.patient, self.patient)

    def test_dcnt_null_patient(self):
        dcnt = DCNT.objects.create(is_diagnosed=False)
        self.assertIsNone(dcnt.patient)
        self.assertFalse(dcnt.is_diagnosed)


class HASModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="patient_has", email="has@test.com", password="123456")
        self.patient = PatientUser.objects.create(user=self.user)

    def test_has_complications_choice(self):
        has = HAS.objects.create(patient=self.patient, any_complications_HBP="AVC")
        self.assertEqual(has.any_complications_HBP, "AVC")


class DMModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="patient_dm", email="dm@test.com", password="123456")
        self.patient = PatientUser.objects.create(user=self.user)

    def test_dm_treatment_and_comorbidities(self):
        dm = DM.objects.create(
            patient=self.patient,
            treatment_type="Oral",
            diabetes_comorbidities="Cardiaca",
            diabetic_foot=True
        )
        self.assertEqual(dm.treatment_type, "Oral")
        self.assertEqual(dm.diabetes_comorbidities, "Cardiaca")
        self.assertTrue(dm.diabetic_foot)


class OtherDCNTModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="patient_other", email="other@test.com", password="123456")
        self.patient = PatientUser.objects.create(user=self.user)

    def test_other_dcnd_name(self):
        other = OtherDCNT.objects.create(patient=self.patient, name="Outra Condição")
        self.assertEqual(other.name, "Outra Condição")
