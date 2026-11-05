from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import PatientUser, ManagerUser, ProfessionalUser
from apps.accounts.models_password_reset import PasswordResetToken, hash_token
from apps.accounts.api.v1.serializers import PatientUserSerializer


class SecurityAndAPITest(APITestCase):
    def setUp(self):
        self.manager_user = User.objects.create_user(
            username="manager_u", password="Password123!", is_staff=True
        )
        self.manager = ManagerUser.objects.create(
            user=self.manager_user, phone="83999999999"
        )

        self.patient_user = User.objects.create_user(
            username="11122233344", first_name="Ana", last_name="Silva", password="Password123!"
        )
        self.patient = PatientUser.objects.create(
            user=self.patient_user, cpf="11122233344"
        )

    def test_check_cpf_forbidden_for_patient(self):
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get("/api/v1/accounts/patients/check-cpf/?cpf=11122233344")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_check_cpf_allowed_for_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.get("/api/v1/accounts/patients/check-cpf/?cpf=11122233344")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("exists"))

    def test_password_reset_token_is_hashed_in_db(self):
        # Create token
        token_obj, raw_token = PasswordResetToken.create_for_user(self.patient_user)
        
        # Verify raw_token is NOT saved directly in token column
        self.assertNotEqual(token_obj.token, raw_token)
        self.assertEqual(token_obj.token, hash_token(raw_token))

        # Test finding token by raw token
        found = PasswordResetToken.find_token(raw_token)
        self.assertIsNotNone(found)
        self.assertEqual(found.id, token_obj.id)

    def test_patient_serializer_updates_nested_user(self):
        serializer = PatientUserSerializer(
            instance=self.patient,
            data={
                "user": {
                    "username": "11122233344",
                    "first_name": "Ana Paula",
                    "last_name": "Souza",
                    "email": "ana.paula@example.com"
                },
                "gender": "Feminino",
                "phone": "83988887777"
            },
            partial=True
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_patient = serializer.save()

        # Check PatientUser field
        self.assertEqual(updated_patient.phone, "83988887777")
        # Check User fields
        self.patient_user.refresh_from_db()
        self.assertEqual(self.patient_user.first_name, "Ana Paula")
        self.assertEqual(self.patient_user.last_name, "Souza")
        self.assertEqual(self.patient_user.email, "ana.paula@example.com")

