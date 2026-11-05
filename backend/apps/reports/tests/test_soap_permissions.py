from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser


class SOAPReportPermissionsTest(APITestCase):
    def setUp(self):
        self.patient1_user = User.objects.create_user(
            username="patient1", password="Password123!"
        )
        self.patient1 = PatientUser.objects.create(
            user=self.patient1_user, cpf="11111111111"
        )

        self.patient2_user = User.objects.create_user(
            username="patient2", password="Password123!"
        )
        self.patient2 = PatientUser.objects.create(
            user=self.patient2_user, cpf="22222222222"
        )

        self.prof_user = User.objects.create_user(
            username="prof1", password="Password123!"
        )
        self.prof = ProfessionalUser.objects.create(
            user=self.prof_user, role="Médico"
        )

    def test_patient_cannot_generate_soap_for_other_patient(self):
        # Patient 1 tries to access Patient 2's SOAP
        self.client.force_authenticate(user=self.patient1_user)
        response = self.client.post(
            "/api/v1/reports/soap/generate/",
            {"patient_id": self.patient2.id},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patient_can_generate_own_soap_report(self):
        self.client.force_authenticate(user=self.patient1_user)
        response = self.client.post(
            "/api/v1/reports/soap/generate/",
            {"patient_id": self.patient1.id},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("subjetivo", response.data)

    def test_professional_can_generate_soap_report(self):
        self.client.force_authenticate(user=self.prof_user)
        response = self.client.post(
            "/api/v1/reports/soap/generate/",
            {"patient_id": self.patient1.id},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("subjetivo", response.data)

