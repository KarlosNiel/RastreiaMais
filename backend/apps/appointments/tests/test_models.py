from django.test import TestCase
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser, ProfessionalUser
from apps.locations.models import Institution
from apps.appointments.models import Appointment
from django.utils.timezone import now, timedelta
from django.core.exceptions import ValidationError

class AppointmentModelTest(TestCase):
    def setUp(self):
        # Criar usuários
        user_patient = User.objects.create_user(
            username="patient1",
            password="123456",
            first_name="Patient",
            last_name="One"
        )
        self.patient = PatientUser.objects.create(user=user_patient)

        user_professional = User.objects.create_user(
            username="prof1",
            password="123456",
            first_name="Professional",
            last_name="One"
        )
        self.professional = ProfessionalUser.objects.create(user=user_professional, role="Enfermeiro")

        # Criar instituição
        self.institution = Institution.objects.create(name="Clínica Teste")

        # Horário agendado
        self.scheduled_datetime = now() + timedelta(days=1)

    def test_create_appointment_with_all_fields(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime,
            local=self.institution,
            risk_level="Moderado",
            type="Consulta",
            description="Consulta de rotina",
            status="Agendado"
        )
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.professional, self.professional)
        self.assertEqual(appointment.local, self.institution)
        self.assertEqual(appointment.risk_level, "Moderado")
        self.assertEqual(appointment.type, "Consulta")
        self.assertEqual(appointment.status, "Agendado")
        self.assertEqual(appointment.description, "Consulta de rotina")

    def test_create_appointment_without_optional_fields(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime,
            risk_level="Seguro",
            type="Exame"
        )
        self.assertIsNone(appointment.local)
        self.assertIsNone(appointment.status)
        self.assertIsNone(appointment.description)

    def test_str_representation(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime,
            risk_level="Crítico",
            type="Evento"
        )
        expected_str = f"{appointment.patient} - {self.scheduled_datetime.strftime('%d/%m/%Y %H:%M')}"
        self.assertEqual(str(appointment), expected_str)

    def test_appointment_requires_patient_and_professional(self):
        from django.db.utils import IntegrityError
        with self.assertRaises(IntegrityError):
            Appointment.objects.create(
                patient=None,
                professional=None,
                scheduled_datetime=self.scheduled_datetime,
                risk_level="Seguro",
                type="Consulta"
            )

    def test_invalid_risk_level_raises_validation_error(self):
        appointment = Appointment(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime,
            risk_level="Inexistente",
            type="Consulta"
        )
        with self.assertRaises(ValidationError):
            appointment.full_clean()
