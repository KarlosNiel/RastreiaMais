"""
Testes para modelos do app pendency
"""
from django.test import TestCase
from pendency.models import Pendency
from pendency.tests.factories import PendencyFactory


class PendencyModelTest(TestCase):
    """Testes para o modelo Pendency"""
    
    def test_create_pendency(self):
        """Testa criação de Pendency"""
        pendency = PendencyFactory()
        
        self.assertIsInstance(pendency, Pendency)
        self.assertIsNotNone(pendency.patient)
        self.assertIsNotNone(pendency.micro_area)
    
    def test_pendency_optional_micro_area(self):
        """Testa campo opcional micro_area do Pendency"""
        pendency = PendencyFactory(micro_area=None)
        
        self.assertIsNone(pendency.micro_area)
        self.assertIsInstance(pendency, Pendency)
    
    def test_pendency_cascade_delete_patient(self):
        """Testa que deletar PatientUser deleta Pendency"""
        pendency = PendencyFactory()
        patient = pendency.patient
        
        # Deleta o paciente (hard delete para testar CASCADE)
        patient.hard_delete()
        
        # Verifica que Pendency foi deletado permanentemente
        self.assertFalse(Pendency.objects.filter(id=pendency.id).exists())
    
    def test_pendency_set_null_micro_area(self):
        """Testa que deletar MicroArea seta null no Pendency"""
        pendency = PendencyFactory()
        micro_area = pendency.micro_area
        
        # Deleta a micro área (hard delete para testar SET_NULL)
        micro_area.hard_delete()
        
        # Verifica que Pendency ainda existe mas micro_area é None
        pendency.refresh_from_db()
        self.assertFalse(pendency.is_deleted)
        self.assertIsNone(pendency.micro_area)
    
    def test_pendency_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        pendency = PendencyFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(pendency.created_at)
        self.assertIsNotNone(pendency.updated_at)
        self.assertIsNotNone(pendency.created_by)
        self.assertFalse(pendency.is_deleted)
        
        # Testa soft delete
        pendency.delete()
        self.assertTrue(pendency.is_deleted)
        self.assertIsNotNone(pendency.deleted_at)
        
        # Testa restore
        pendency.restore()
        self.assertFalse(pendency.is_deleted)
        self.assertIsNone(pendency.deleted_at)
    
    def test_pendency_relationships(self):
        """Testa relacionamentos do Pendency"""
        pendency = PendencyFactory()
        
        # Verifica que pode acessar os relacionamentos
        self.assertIsNotNone(pendency.patient.user)
        self.assertIsNotNone(pendency.micro_area.address)
        
        # Verifica que pode acessar relacionamentos reversos
        patient_pendencies = pendency.patient.pendency_set.all()
        self.assertIn(pendency, patient_pendencies)
        
        micro_area_pendencies = pendency.micro_area.pendency_set.all()
        self.assertIn(pendency, micro_area_pendencies)
    
    def test_multiple_pendencies_per_patient(self):
        """Testa que um paciente pode ter múltiplas pendências"""
        patient = PendencyFactory().patient
        pendency1 = PendencyFactory(patient=patient)
        pendency2 = PendencyFactory(patient=patient)
        
        # Verifica que o paciente tem múltiplas pendências
        patient_pendencies = patient.pendency_set.filter(id__in=[pendency1.id, pendency2.id])
        self.assertEqual(len(patient_pendencies), 2)
        self.assertIn(pendency1, patient_pendencies)
        self.assertIn(pendency2, patient_pendencies)
    
    def test_multiple_pendencies_per_micro_area(self):
        """Testa que uma micro área pode ter múltiplas pendências"""
        micro_area = PendencyFactory().micro_area
        pendency1 = PendencyFactory(micro_area=micro_area)
        pendency2 = PendencyFactory(micro_area=micro_area)
        
        # Verifica que a micro área tem múltiplas pendências
        micro_area_pendencies = micro_area.pendency_set.filter(id__in=[pendency1.id, pendency2.id])
        self.assertEqual(len(micro_area_pendencies), 2)
        self.assertIn(pendency1, micro_area_pendencies)
        self.assertIn(pendency2, micro_area_pendencies)
