from django.test import TestCase
from django.contrib.auth.models import User
from accounts.models import *
from django.db import IntegrityError

# Create your tests here.
class PatientUserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='patient_test',
            email='patient@test.com',
            first_name = 'Carlos Daniel',
            last_name = 'Lucena da Silva'
        )

    def create_patient_user_test(self):
        patient = PatientUser.objects.create(user=self.user)

        self.assertIsInstance(patient, PatientUser)
        self.assertEqual(patient.user, self.user)
        self.assertTrue(hasattr(patient, 'created_at'))
        self.assertTrue(hasattr(patient, 'updated_at'))

    def patient_user_str_method_test(self):
        patient = PatientUser.objects.create(user=self.user)
        expected_str = f"Patient: {self.user.get_full_name()}"

        self.assertEqual(str(patient), expected_str)

    def patient_user_str_without_full_name(self):
        user_no_name = User.objects.create_user(username='no_name')
        patient = PatientUser.objects.create(user=user_no_name)
        
        self.assertEqual(str(patient), "Patient: ")

    def one_to_one_relationship_constraint(self):
        PatientUser.objects.create(user=self.user)
        
        with self.assertRaises(IntegrityError):
            PatientUser.objects.create(user=self.user)