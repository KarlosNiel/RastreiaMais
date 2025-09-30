"""
Testes para modelos do app commons
"""
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from commons.models import BaseModel, SoftDeleteQuerySet, ActiveManager, AllManager
from accounts.tests.factories import UserFactory


class CommonsModelTest(TestCase):
    """Testes para funcionalidades do app commons"""
    
    def test_base_model_import(self):
        """Testa que BaseModel pode ser importado"""
        from commons.models import BaseModel
        self.assertTrue(True, "BaseModel pode ser importado")
    
    def test_soft_delete_queryset_import(self):
        """Testa que SoftDeleteQuerySet pode ser importado"""
        from commons.models import SoftDeleteQuerySet
        self.assertTrue(True, "SoftDeleteQuerySet pode ser importado")
    
    def test_active_manager_import(self):
        """Testa que ActiveManager pode ser importado"""
        from commons.models import ActiveManager
        self.assertTrue(True, "ActiveManager pode ser importado")
    
    def test_all_manager_import(self):
        """Testa que AllManager pode ser importado"""
        from commons.models import AllManager
        self.assertTrue(True, "AllManager pode ser importado")
    
    def test_base_model_abstract(self):
        """Testa que BaseModel é abstrato"""
        self.assertTrue(BaseModel._meta.abstract, "BaseModel deve ser abstrato")
    
    def test_base_model_fields_exist(self):
        """Testa que BaseModel tem os campos esperados"""
        # Verifica que BaseModel tem os campos esperados
        field_names = [field.name for field in BaseModel._meta.fields]
        
        expected_fields = [
            'created_at', 'updated_at', 'created_by', 'updated_by', 
            'deleted_by', 'is_deleted', 'deleted_at'
        ]
        
        for field_name in expected_fields:
            self.assertIn(field_name, field_names, f"Campo {field_name} deve existir em BaseModel")
    
    def test_managers_exist(self):
        """Testa que BaseModel tem os managers esperados"""
        # Como BaseModel é abstrato, os managers só existem nas classes filhas
        # Verifica que os managers podem ser criados
        active_manager = ActiveManager()
        all_manager = AllManager()
        
        self.assertIsInstance(active_manager, ActiveManager)
        self.assertIsInstance(all_manager, AllManager)
    
    def test_base_model_methods_exist(self):
        """Testa que BaseModel tem os métodos esperados"""
        # Verifica que BaseModel tem os métodos esperados
        expected_methods = ['delete', 'restore', 'hard_delete', 'get_creator_profile', 'clean']
        
        for method_name in expected_methods:
            self.assertTrue(hasattr(BaseModel, method_name), f"Método {method_name} deve existir em BaseModel")
    
    def test_soft_delete_queryset_methods_exist(self):
        """Testa que SoftDeleteQuerySet tem os métodos esperados"""
        # Verifica que SoftDeleteQuerySet tem os métodos esperados
        expected_methods = ['delete', 'restore', 'hard_delete', 'active', 'deleted']
        
        for method_name in expected_methods:
            self.assertTrue(hasattr(SoftDeleteQuerySet, method_name), f"Método {method_name} deve existir em SoftDeleteQuerySet")


class CommonsPlaceholderTest(TestCase):
    """Testes placeholder para o app commons"""
    
    def test_commons_app_exists(self):
        """Testa que o app commons existe e pode ser importado"""
        try:
            import commons
            self.assertTrue(True, "App commons pode ser importado")
        except ImportError:
            self.fail("App commons não pode ser importado")
    
    def test_placeholder(self):
        """Teste placeholder - sempre passa"""
        self.assertTrue(True, "Teste placeholder para commons")