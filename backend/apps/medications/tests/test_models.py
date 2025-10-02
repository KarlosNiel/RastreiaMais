from django.test import TestCase
from django.contrib.auth.models import User
from django.utils.timezone import now, timedelta
from apps.accounts.models import PatientUser
from apps.medications.models import Medication
from django.db.utils import IntegrityError

class MedicationModelTest(TestCase):

    def setUp(self):
        # Criando um usuário e paciente
        self.user = User.objects.create_user(
            username="testuser",
            password="password123",
            first_name="Test",
            last_name="User"
        )
        self.patient = PatientUser.objects.create(user=self.user)

    def test_creating_medication_without_end_date_raises_error(self):
        with self.assertRaises(IntegrityError):
            Medication.objects.create(
                patient=self.patient,
                name="Med No End Date",
                description="No end date",
                end_date=None,  
                active=True
            )

    def test_is_active_with_future_end_date(self):
        future_date = now().date() + timedelta(days=5)
        med = Medication.objects.create(
            patient=self.patient,
            name="Future Med",
            description="Ends in the future",
            end_date=future_date,
            active=True
        )
        self.assertTrue(med.is_active())

    def test_is_active_with_past_end_date(self):
        past_date = now().date() - timedelta(days=5)
        med = Medication.objects.create(
            patient=self.patient,
            name="Past Med",
            description="Ended in the past",
            end_date=past_date,
            active=True
        )
        self.assertFalse(med.is_active())

    def test_finished_marks_is_deleted(self):
        past_date = now().date() - timedelta(days=1)
        med = Medication.objects.create(
            patient=self.patient,
            name="Expired Med",
            description="Expired medication",
            end_date=past_date,
            active=True
        )
        med.finished()
        self.assertTrue(med.is_deleted)

    def test_finished_does_not_mark_active_medication(self):
        future_date = now().date() + timedelta(days=5)
        med = Medication.objects.create(
            patient=self.patient,
            name="Active Med",
            description="Still active",
            end_date=future_date,
            active=True
        )
        med.finished()
        self.assertFalse(med.is_deleted)
