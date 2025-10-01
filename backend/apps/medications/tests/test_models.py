"""
Testes para modelos do app medications
"""
from django.test import TestCase
from django.utils import timezone
from datetime import date, timedelta
from apps.accounts.tests.factories import PatientWithCreatorFactory
from apps.medications.models import Medication


class MedicationModelTest(TestCase):
    """Testes para o modelo Medication"""
    
    def setUp(self):
        self.patient = PatientWithCreatorFactory()
    
    def test_create_medication(self):
        """Testa criação de medicamento"""
        medication = Medication.objects.create(
            patient=self.patient,
            name='Paracetamol',
            description='Analgésico e antitérmico',
            end_date=date.today() + timedelta(days=30),
            active=True
        )
        
        self.assertIsInstance(medication, Medication)
        self.assertEqual(medication.patient, self.patient)
        self.assertEqual(medication.name, 'Paracetamol')
        self.assertTrue(medication.active)
        self.assertFalse(medication.is_deleted)
    
    def test_is_active_method(self):
        """Testa método is_active"""
        # Medicamento ativo (data futura)
        future_date = date.today() + timedelta(days=30)
        medication = Medication.objects.create(
            patient=self.patient,
            name='Medicamento Ativo',
            description='Teste',
            end_date=future_date,
            active=True
        )
        
        self.assertTrue(medication.is_active())
        
        # Medicamento vencido (data passada)
        past_date = date.today() - timedelta(days=1)
        expired_medication = Medication.objects.create(
            patient=self.patient,
            name='Medicamento Vencido',
            description='Teste',
            end_date=past_date,
            active=True
        )
        
        self.assertFalse(expired_medication.is_active())
        
        # Medicamento sem data de fim
        medication_no_end = Medication.objects.create(
            patient=self.patient,
            name='Medicamento Sem Fim',
            description='Teste',
            end_date=None,
            active=True
        )
        
        self.assertTrue(medication_no_end.is_active())
    
    def test_finished_method(self):
        """Testa método finished"""
        past_date = date.today() - timedelta(days=1)
        medication = Medication.objects.create(
            patient=self.patient,
            name='Medicamento Vencido',
            description='Teste',
            end_date=past_date,
            active=True
        )
        
        # Verifica que não está deletado inicialmente
        self.assertFalse(medication.is_deleted)
        
        # Chama método finished
        medication.finished()
        
        # Verifica que foi marcado como deletado
        self.assertTrue(medication.is_deleted)
    
    def test_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        medication = Medication.objects.create(
            patient=self.patient,
            name='Teste Soft Delete',
            description='Teste',
            end_date=date.today() + timedelta(days=30),
            active=True
        )
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(medication.created_at)
        self.assertIsNotNone(medication.updated_at)
        self.assertIsNotNone(medication.created_by)
        
        # Testa soft delete
        medication.delete()
        self.assertTrue(medication.is_deleted)
        self.assertIsNotNone(medication.deleted_at)
        
        # Testa restore
        medication.restore()
        self.assertFalse(medication.is_deleted)
        self.assertIsNone(medication.deleted_at)
    
    def test_medication_str_representation(self):
        """Testa representação string do medicamento"""
        medication = Medication.objects.create(
            patient=self.patient,
            name='Aspirina',
            description='Anti-inflamatório',
            end_date=date.today() + timedelta(days=30),
            active=True
        )
        
        # Como não há método __str__ definido, usa a representação padrão
        str_repr = str(medication)
        self.assertIn('Medication', str_repr)
        self.assertIn(str(medication.pk), str_repr)
