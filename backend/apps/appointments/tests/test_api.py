from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.appointments.models import Appointment


class AppointmentAPITest(APITestCase):
    def setUp(self):
        self.manager_user = User.objects.create_user(
            username="manager_app", password="Password123!", is_staff=True
        )
        self.manager = ManagerUser.objects.create(
            user=self.manager_user, phone="83999999999"
        )

        self.prof_user = User.objects.create_user(
            username="prof_app", password="Password123!"
        )
        self.prof = ProfessionalUser.objects.create(
            user=self.prof_user, role="Médico"
        )

        self.patient1_user = User.objects.create_user(
            username="11111111111", password="Password123!"
        )
        self.patient1 = PatientUser.objects.create(
            user=self.patient1_user, cpf="11111111111"
        )

        self.patient2_user = User.objects.create_user(
            username="22222222222", password="Password123!"
        )
        self.patient2 = PatientUser.objects.create(
            user=self.patient2_user, cpf="22222222222"
        )

        self.scheduled_time = timezone.now() + timedelta(days=1)

    def test_prevent_double_booking_same_professional_same_time(self):
        self.client.force_authenticate(user=self.manager_user)

        # Create first appointment
        Appointment.objects.create(
            patient=self.patient1,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time,
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )

        # Try to schedule another appointment with same professional at exact same time
        response = self.client.post(
            "/api/v1/appointments/appointments/",
            {
                "patient_id": self.patient2.id,
                "professional_id": self.prof.id,
                "scheduled_datetime": self.scheduled_time.isoformat(),
                "type": "Consulta",
                "risk_level": "Seguro",
                "status": "ativo",
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("scheduled_datetime", response.data)

    def test_filter_appointments_by_patient_id(self):
        self.client.force_authenticate(user=self.manager_user)

        app1 = Appointment.objects.create(
            patient=self.patient1,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time,
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )
        app2 = Appointment.objects.create(
            patient=self.patient2,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time + timedelta(hours=1),
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )

        response = self.client.get(f"/api/v1/appointments/appointments/?patient_id={self.patient1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data.get("results", response.data)
        ids = [item["id"] for item in data]
        self.assertIn(app1.id, ids)
        self.assertNotIn(app2.id, ids)

