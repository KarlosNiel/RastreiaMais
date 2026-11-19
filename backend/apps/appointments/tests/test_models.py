from django.test import TestCase
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser, ProfessionalUser
from apps.locations.models import Institution
from apps.appointments.models import Appointment
from apps.appointments.utils import calculate_risk_from_patient
from apps.conditions.models import DM, HAS
from apps.conditions.constants.has_choices import (
    FraminghamScoreChoices,
    HypertensionComplicationsChoices,
)
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

    def test_calculate_risk_from_patient_with_high_risk_complications(self):
        # Sem HAS cadastrada -> Moderado
        self.assertEqual(calculate_risk_from_patient(self.patient), "Moderado")

        # Com condição de alto risco direta (ex: AIT) -> Crítico
        has = HAS.objects.create(
            patient=self.patient,
            any_complications_HBP=HypertensionComplicationsChoices.AIT,
        )
        self.assertEqual(calculate_risk_from_patient(self.patient), "Crítico")

        # Com LOA -> Crítico
        has.any_complications_HBP = HypertensionComplicationsChoices.LOA
        has.save()
        self.assertEqual(calculate_risk_from_patient(self.patient), "Crítico")

        # Com OUTRA -> Crítico
        has.any_complications_HBP = HypertensionComplicationsChoices.OUTRA
        has.save()
        self.assertEqual(calculate_risk_from_patient(self.patient), "Crítico")

    def test_calculate_risk_from_patient_dm_hba1c_and_comorbidity(self):
        dm = DM.objects.create(patient=self.patient, glycated_hemoglobin="6.80")
        self.assertEqual(calculate_risk_from_patient(self.patient), "Seguro")

        dm.glycated_hemoglobin = "8.50"
        dm.save()
        self.assertEqual(calculate_risk_from_patient(self.patient), "Moderado")

        dm.glycated_hemoglobin = "9.50"
        dm.save()
        self.assertEqual(calculate_risk_from_patient(self.patient), "Crítico")

        # Mesmo com HbA1c < 7 e Framingham baixo sem complicação explícita,
        # HAS + DM concomitantes devem resultar em risco Crítico.
        dm.glycated_hemoglobin = "6.80"
        dm.save()
        HAS.objects.create(
            patient=self.patient,
            framingham_score=FraminghamScoreChoices.BAIXO,
            any_complications_HBP=None,
        )
        self.assertEqual(calculate_risk_from_patient(self.patient), "Crítico")

    def test_signal_updates_active_appointments_including_empty_status(self):
        dm = DM.objects.create(patient=self.patient, glycated_hemoglobin="6.80")
        appt_ativo = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime,
            risk_level="Seguro",
            type="Retorno",
            status="ativo",
        )
        appt_empty = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime + timedelta(hours=1),
            risk_level="Seguro",
            type="Consulta",
            status="",
        )
        appt_done = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=self.scheduled_datetime + timedelta(hours=2),
            risk_level="Seguro",
            type="Consulta",
            status="finalizado",
        )

        dm.glycated_hemoglobin = "8.20"
        dm.save()

        appt_ativo.refresh_from_db()
        appt_empty.refresh_from_db()
        appt_done.refresh_from_db()
        self.assertEqual(appt_ativo.risk_level, "Moderado")
        self.assertEqual(appt_empty.risk_level, "Moderado")
        self.assertEqual(appt_done.risk_level, "Seguro")

