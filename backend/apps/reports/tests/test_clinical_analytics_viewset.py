from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import ProfessionalUser, PatientUser
from apps.conditions.models import HAS, DM
from apps.appointments.models import Appointment

User = get_user_model()


class ClinicalAnalyticsViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="dr_teste",
            password="testpassword123",
            email="dr_teste@example.com",
            first_name="Roberto",
            last_name="Mendes"
        )
        self.professional = ProfessionalUser.objects.create(
            user=self.user,
            role="Médico"
        )
        self.url = "/api/v1/reports/clinical-analytics/"

    def test_unauthenticated_request_fails(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_professional_returns_analytics(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("total_monitored_patients", data)
        self.assertIn("conditions", data)
        self.assertIn("blood_pressure", data)
        self.assertIn("glycemia", data)
        self.assertIn("framingham_risk", data)
        self.assertIn("appointments_overview", data)
        self.assertIn("alerts_overview", data)

        # Verifica chaves específicas
        self.assertIn("has_count", data["conditions"])
        self.assertIn("dm_count", data["conditions"])
        self.assertIn("both_count", data["conditions"])
        self.assertIn("adherence_rate", data["conditions"])
        self.assertIn("controlled", data["blood_pressure"])
        self.assertIn("stage_3_critical", data["blood_pressure"])
        self.assertIn("baixo", data["framingham_risk"])
        self.assertIn("alto", data["framingham_risk"])

    def test_analytics_with_patient_data(self):
        patient_u = User.objects.create_user(
            username="paciente_teste",
            password="testpassword123",
            first_name="Jose",
            last_name="Silva"
        )
        patient = PatientUser.objects.create(
            user=patient_u,
            cpf="99988877766",
            birth_date="1970-01-01"
        )
        HAS.objects.create(
            patient=patient,
            is_diagnosed=True,
            uses_medication="SIM",
            BP_classifications="HIPERTENSO_E2",
            framingham_score="ALTO"
        )
        DM.objects.create(
            patient=patient,
            is_diagnosed=True,
            uses_medication="SIM",
            screening_result="DIAGNOSTICO_CONFIRMADO",
            treatment_type="INSULINA"
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertGreaterEqual(data["total_monitored_patients"], 1)
        self.assertGreaterEqual(data["conditions"]["has_count"], 1)
        self.assertGreaterEqual(data["conditions"]["dm_count"], 1)
        self.assertGreaterEqual(data["conditions"]["both_count"], 1)
        self.assertGreaterEqual(data["framingham_risk"]["alto"], 1)

