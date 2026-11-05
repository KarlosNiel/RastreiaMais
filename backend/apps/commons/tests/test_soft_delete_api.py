from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import ManagerUser, PatientUser
from apps.medications.models import Medication


class SoftDeleteAPITest(APITestCase):
    def setUp(self):
        self.manager_user = User.objects.create_user(
            username="manager_test", password="Password123!", is_staff=True
        )
        self.manager = ManagerUser.objects.create(
            user=self.manager_user, phone="83999999999"
        )

        self.patient_user = User.objects.create_user(
            username="12345678900", password="Password123!"
        )
        self.patient = PatientUser.objects.create(
            user=self.patient_user, cpf="12345678900"
        )

        self.med1 = Medication.objects.create(
            patient=self.patient, name="Losartana", description="50mg"
        )
        self.med2 = Medication.objects.create(
            patient=self.patient, name="Metformina", description="850mg"
        )

    def test_soft_deleted_item_is_excluded_from_list(self):
        self.client.force_authenticate(user=self.manager_user)

        # Soft delete med1
        self.med1.delete()

        response = self.client.get("/api/v1/medications/medications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data.get("results", response.data)
        ids = [item["id"] for item in data]
        self.assertNotIn(self.med1.id, ids)
        self.assertIn(self.med2.id, ids)

    def test_restore_action_restores_soft_deleted_item(self):
        self.client.force_authenticate(user=self.manager_user)

        self.med1.delete()
        restore_url = f"/api/v1/medications/medications/{self.med1.id}/restore/"
        response = self.client.patch(restore_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify it now appears in list again
        list_response = self.client.get("/api/v1/medications/medications/")
        data = list_response.data.get("results", list_response.data)
        ids = [item["id"] for item in data]
        self.assertIn(self.med1.id, ids)

