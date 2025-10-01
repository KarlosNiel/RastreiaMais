"""
Testes para modelos do app conditions
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.conditions.models import DCNT, HAS, DM, OtherDCNT
from apps.conditions.tests.factories import DCNTFactory, HASFactory, DMFactory, OtherDCNTFactory


class DCNTModelTest(TestCase):
    """Testes para o modelo DCNT"""
    
    def test_create_dcnt(self):
        """Testa criação de DCNT"""
        dcnt = DCNTFactory()
        
        self.assertIsInstance(dcnt, DCNT)
        self.assertIsNotNone(dcnt.patient)
        self.assertIsNotNone(dcnt.is_diagnosed)
        self.assertIsNotNone(dcnt.uses_medication)
        self.assertIsNotNone(dcnt.family_history)
    
    def test_dcnt_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        dcnt = DCNTFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(dcnt.created_at)
        self.assertIsNotNone(dcnt.updated_at)
        self.assertIsNotNone(dcnt.created_by)
        self.assertFalse(dcnt.is_deleted)
        
        # Testa soft delete
        dcnt.delete()
        self.assertTrue(dcnt.is_deleted)
        self.assertIsNotNone(dcnt.deleted_at)
        
        # Testa restore
        dcnt.restore()
        self.assertFalse(dcnt.is_deleted)
        self.assertIsNone(dcnt.deleted_at)
    
    def test_dcnt_optional_fields(self):
        """Testa campos opcionais do DCNT"""
        dcnt = DCNTFactory(
            patient=None,
            medications_name=None
        )
        
        self.assertIsNone(dcnt.patient)
        self.assertIsNone(dcnt.medications_name)
        self.assertIsInstance(dcnt, DCNT)


class HASModelTest(TestCase):
    """Testes para o modelo HAS"""
    
    def test_create_has(self):
        """Testa criação de HAS"""
        has_obj = HASFactory()
        
        self.assertIsInstance(has_obj, HAS)
        self.assertIsInstance(has_obj, DCNT)  # Verifica herança
        self.assertIsNotNone(has_obj.patient)
        self.assertIn(has_obj.any_complications_HBP, ['AVC', 'Infarto', None])
    
    def test_has_choices_validation(self):
        """Testa validação de choices do campo any_complications_HBP"""
        has_obj = HASFactory()
        
        # Testa choice válido
        has_obj.any_complications_HBP = 'AVC'
        has_obj.full_clean()  # Deve passar
        
        has_obj.any_complications_HBP = 'Infarto'
        has_obj.full_clean()  # Deve passar
        
        has_obj.any_complications_HBP = None
        has_obj.full_clean()  # Deve passar
    
    def test_has_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        has_obj = HASFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(has_obj.created_at)
        self.assertIsNotNone(has_obj.updated_at)
        self.assertIsNotNone(has_obj.created_by)
        
        # Testa soft delete
        has_obj.delete()
        self.assertTrue(has_obj.is_deleted)
        self.assertIsNotNone(has_obj.deleted_at)
        
        # Testa restore
        has_obj.restore()
        self.assertFalse(has_obj.is_deleted)
        self.assertIsNone(has_obj.deleted_at)


class DMModelTest(TestCase):
    """Testes para o modelo DM"""
    
    def test_create_dm(self):
        """Testa criação de DM"""
        dm_obj = DMFactory()
        
        self.assertIsInstance(dm_obj, DM)
        self.assertIsInstance(dm_obj, DCNT)  # Verifica herança
        self.assertIsNotNone(dm_obj.patient)
        self.assertIn(dm_obj.treatment_type, ['Oral', 'Insulina', None])
        self.assertIn(dm_obj.diabetes_comorbidities, ['Cardiaca', 'Renal', None])
    
    def test_dm_choices_validation(self):
        """Testa validação de choices dos campos do DM"""
        dm_obj = DMFactory()
        
        # Testa choices válidos para treatment_type
        dm_obj.treatment_type = 'Oral'
        dm_obj.full_clean()  # Deve passar
        
        dm_obj.treatment_type = 'Insulina'
        dm_obj.full_clean()  # Deve passar
        
        # Testa choices válidos para diabetes_comorbidities
        dm_obj.diabetes_comorbidities = 'Cardiaca'
        dm_obj.full_clean()  # Deve passar
        
        dm_obj.diabetes_comorbidities = 'Renal'
        dm_obj.full_clean()  # Deve passar
    
    def test_dm_optional_fields(self):
        """Testa campos opcionais do DM"""
        dm_obj = DMFactory(
            treatment_type=None,
            treatment_type_other=None,
            diabetes_comorbidities=None,
            diabetes_comorbidities_others=None,
            diabetic_foot=None,
            diabetic_foot_member=None
        )
        
        self.assertIsNone(dm_obj.treatment_type)
        self.assertIsNone(dm_obj.treatment_type_other)
        self.assertIsNone(dm_obj.diabetes_comorbidities)
        self.assertIsNone(dm_obj.diabetes_comorbidities_others)
        self.assertIsNone(dm_obj.diabetic_foot)
        self.assertIsNone(dm_obj.diabetic_foot_member)
    
    def test_dm_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        dm_obj = DMFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(dm_obj.created_at)
        self.assertIsNotNone(dm_obj.updated_at)
        self.assertIsNotNone(dm_obj.created_by)
        
        # Testa soft delete
        dm_obj.delete()
        self.assertTrue(dm_obj.is_deleted)
        self.assertIsNotNone(dm_obj.deleted_at)
        
        # Testa restore
        dm_obj.restore()
        self.assertFalse(dm_obj.is_deleted)
        self.assertIsNone(dm_obj.deleted_at)


class OtherDCNTModelTest(TestCase):
    """Testes para o modelo OtherDCNT"""
    
    def test_create_other_dcnt(self):
        """Testa criação de OtherDCNT"""
        other_dcnt = OtherDCNTFactory()
        
        self.assertIsInstance(other_dcnt, OtherDCNT)
        self.assertIsInstance(other_dcnt, DCNT)  # Verifica herança
        self.assertIsNotNone(other_dcnt.patient)
        self.assertIsNotNone(other_dcnt.name)
    
    def test_other_dcnt_optional_name(self):
        """Testa campo opcional name do OtherDCNT"""
        other_dcnt = OtherDCNTFactory(name=None)
        
        self.assertIsNone(other_dcnt.name)
        self.assertIsInstance(other_dcnt, OtherDCNT)
    
    def test_other_dcnt_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        other_dcnt = OtherDCNTFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(other_dcnt.created_at)
        self.assertIsNotNone(other_dcnt.updated_at)
        self.assertIsNotNone(other_dcnt.created_by)
        
        # Testa soft delete
        other_dcnt.delete()
        self.assertTrue(other_dcnt.is_deleted)
        self.assertIsNotNone(other_dcnt.deleted_at)
        
        # Testa restore
        other_dcnt.restore()
        self.assertFalse(other_dcnt.is_deleted)
        self.assertIsNone(other_dcnt.deleted_at)


class ConditionsInheritanceTest(TestCase):
    """Testes para verificar herança entre modelos de condições"""
    
    def test_dcnt_inheritance(self):
        """Testa que todos os modelos herdam de DCNT"""
        dcnt = DCNTFactory()
        has_obj = HASFactory()
        dm_obj = DMFactory()
        other_dcnt = OtherDCNTFactory()
        
        # Todos devem ser instâncias de DCNT
        self.assertIsInstance(has_obj, DCNT)
        self.assertIsInstance(dm_obj, DCNT)
        self.assertIsInstance(other_dcnt, DCNT)
        
        # Todos devem ter os campos básicos de DCNT
        for obj in [has_obj, dm_obj, other_dcnt]:
            self.assertTrue(hasattr(obj, 'patient'))
            self.assertTrue(hasattr(obj, 'is_diagnosed'))
            self.assertTrue(hasattr(obj, 'uses_medication'))
            self.assertTrue(hasattr(obj, 'medications_name'))
            self.assertTrue(hasattr(obj, 'family_history'))
    
    def test_base_model_inheritance(self):
        """Testa que todos os modelos herdam de BaseModel"""
        dcnt = DCNTFactory()
        has_obj = HASFactory()
        dm_obj = DMFactory()
        other_dcnt = OtherDCNTFactory()
        
        # Todos devem ter os campos do BaseModel
        for obj in [dcnt, has_obj, dm_obj, other_dcnt]:
            self.assertTrue(hasattr(obj, 'created_at'))
            self.assertTrue(hasattr(obj, 'updated_at'))
            self.assertTrue(hasattr(obj, 'created_by'))
            self.assertTrue(hasattr(obj, 'is_deleted'))
            self.assertTrue(hasattr(obj, 'deleted_at'))
            self.assertTrue(hasattr(obj, 'delete'))
            self.assertTrue(hasattr(obj, 'restore'))
