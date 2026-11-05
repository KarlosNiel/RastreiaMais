from datetime import date, timedelta
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.alerts.models import Alert
from apps.conditions.models import HAS
from apps.medications.models import Medication
from apps.pendencies.models import Pendency


class NewFeaturesIntegrationTest(APITestCase):
    def setUp(self):
        self.manager_user = User.objects.create_user(
            username="manager_test_new", password="Password123!", is_staff=True
        )
        self.manager = ManagerUser.objects.create(
            user=self.manager_user, phone="83999999999"
        )

        self.prof_user = User.objects.create_user(
            username="prof_test_new", first_name="Dr.", last_name="Carlos", password="Password123!"
        )
        self.prof = ProfessionalUser.objects.create(
            user=self.prof_user, role="Médico", professional_registry="CRM-PB 12345"
        )

        self.patient_user = User.objects.create_user(
            username="99988877766", first_name="Maria", last_name="Lourdes", password="Password123!"
        )
        self.patient = PatientUser.objects.create(
            user=self.patient_user, cpf="99988877766"
        )

    def test_health_check_endpoint(self):
        # Health check is open without auth
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "healthy")
        self.assertEqual(response.data["database"], "connected")
        self.assertIn("timestamp", response.data)

    def test_alert_lifecycle_and_resolve_action(self):
        self.client.force_authenticate(user=self.prof_user)

        alert = Alert.objects.create(
            patient=self.patient,
            title="Pressão Elevada",
            description="Paciente relatou cefaleia e PA 160/100",
            risk_level="critical",
            status="pending"
        )

        # Resolve alert via API
        url = f"/api/v1/alerts/alerts/{alert.id}/resolve/"
        response = self.client.post(url, {"notes": "Paciente atendido e medicação ajustada."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        alert.refresh_from_db()
        self.assertEqual(alert.status, "resolved")
        self.assertIsNotNone(alert.resolved_at)
        self.assertEqual(alert.resolved_by, self.prof_user)
        self.assertEqual(alert.resolution_notes, "Paciente atendido e medicação ajustada.")

    def test_automatic_alert_trigger_on_critical_condition(self):
        # Create HAS with critical blood pressure (Estágio 2)
        has_instance = HAS.objects.create(
            patient=self.patient,
            is_diagnosed=True,
            BP_classifications="HIPERTENSO_E2"
        )

        # Verify an automatic critical alert was generated
        auto_alerts = Alert.objects.filter(
            patient=self.patient,
            risk_level="critical",
            status="pending"
        )
        self.assertTrue(auto_alerts.exists())
        alert = auto_alerts.first()
        self.assertIn("Risco Crítico", alert.title)

    def test_medication_expiration_command(self):
        yesterday = timezone.now().date() - timedelta(days=1)
        med_expired = Medication.objects.create(
            patient=self.patient,
            name="Antibiótico",
            dosage="500mg",
            frequency="8/8h",
            start_date=yesterday - timedelta(days=7),
            end_date=yesterday,
            active=True
        )

        call_command("update_expired_medications")

        med_expired.refresh_from_db()
        self.assertFalse(med_expired.active)
        self.assertFalse(med_expired.is_deleted)  # Preserved for clinical history

    def test_soap_export_html(self):
        self.client.force_authenticate(user=self.prof_user)

        url = f"/api/v1/reports/soap/export-html/?patient_id={self.patient.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("text/html", response["Content-Type"])
        html_str = response.content.decode("utf-8")
        self.assertIn("Relatório Clínico SOAP", html_str)
        self.assertIn("Maria", html_str)
        self.assertIn("window.print()", html_str)

    def test_pendency_model_fields(self):
        pendency = Pendency.objects.create(
            patient=self.patient,
            description="Visita domiciliar do ACS necessária",
            status="pendente",
            priority="alta",
            due_date=timezone.now().date() + timedelta(days=3),
            assigned_to=self.prof
        )
        self.assertEqual(pendency.status, "pendente")
        self.assertEqual(pendency.priority, "alta")
        self.assertEqual(pendency.assigned_to, self.prof)

