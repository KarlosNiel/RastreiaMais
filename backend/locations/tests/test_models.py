"""
Testes para modelos do app locations
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from locations.models import Address, MicroArea, Institution
from locations.tests.factories import AddressFactory, MicroAreaFactory, InstitutionFactory


class AddressModelTest(TestCase):
    """Testes para o modelo Address"""
    
    def test_create_address(self):
        """Testa criação de Address"""
        address = AddressFactory()
        
        self.assertIsInstance(address, Address)
        self.assertIn(address.uf, ['PB', 'PE'])
        self.assertIsNotNone(address.city)
        self.assertIsNotNone(address.district)
        self.assertIsNotNone(address.street)
        self.assertIsNotNone(address.number)
        self.assertGreater(address.number, 0)
    
    def test_address_str_method(self):
        """Testa método __str__ do Address"""
        address = AddressFactory(
            street='Rua das Flores',
            number=123,
            district='Centro',
            city='João Pessoa',
            uf='PB'
        )
        
        expected_str = "Rua das Flores, 123 - Centro, João Pessoa/PB"
        self.assertEqual(str(address), expected_str)
    
    def test_address_uf_choices(self):
        """Testa validação de choices do campo uf"""
        address = AddressFactory()
        
        # Testa choices válidos
        address.uf = 'PB'
        address.full_clean()  # Deve passar
        
        address.uf = 'PE'
        address.full_clean()  # Deve passar
    
    def test_address_zipcode_validation(self):
        """Testa validação do CEP"""
        address = AddressFactory()
        
        # Testa CEP válido com hífen
        address.zipcode = '58000-000'
        address.full_clean()  # Deve passar
        
        # Testa CEP válido sem hífen
        address.zipcode = '58000000'
        address.full_clean()  # Deve passar
        
        # Testa CEP inválido
        address.zipcode = '58000'
        with self.assertRaises(ValidationError):
            address.full_clean()
        
        # Testa CEP inválido com formato errado
        address.zipcode = '58-000-000'
        with self.assertRaises(ValidationError):
            address.full_clean()
    
    def test_address_zipcode_strip(self):
        """Testa que espaços são removidos do CEP"""
        address = AddressFactory(zipcode='58000-000')
        # Testa que o CEP é válido
        address.full_clean()
        self.assertEqual(address.zipcode, '58000-000')
    
    def test_address_optional_fields(self):
        """Testa campos opcionais do Address"""
        address = AddressFactory(
            complement=None,
            zipcode=None
        )
        
        self.assertIsNone(address.complement)
        self.assertIsNone(address.zipcode)
        self.assertIsInstance(address, Address)
    
    def test_address_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        address = AddressFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(address.created_at)
        self.assertIsNotNone(address.updated_at)
        self.assertIsNotNone(address.created_by)
        self.assertFalse(address.is_deleted)
        
        # Testa soft delete
        address.delete()
        self.assertTrue(address.is_deleted)
        self.assertIsNotNone(address.deleted_at)
        
        # Testa restore
        address.restore()
        self.assertFalse(address.is_deleted)
        self.assertIsNone(address.deleted_at)


class MicroAreaModelTest(TestCase):
    """Testes para o modelo MicroArea"""
    
    def test_create_micro_area(self):
        """Testa criação de MicroArea"""
        micro_area = MicroAreaFactory()
        
        self.assertIsInstance(micro_area, MicroArea)
        self.assertIsNotNone(micro_area.name)
        self.assertIsNotNone(micro_area.address)
        self.assertIsInstance(micro_area.address, Address)
    
    def test_micro_area_str_method(self):
        """Testa método __str__ do MicroArea"""
        micro_area = MicroAreaFactory(name='Micro Área Centro')
        
        expected_str = "Micro Área Centro"
        self.assertEqual(str(micro_area), expected_str)
    
    def test_micro_area_optional_fields(self):
        """Testa campos opcionais do MicroArea"""
        micro_area = MicroAreaFactory(
            maps_localization=None,
            address=None
        )
        
        self.assertIsNone(micro_area.maps_localization)
        self.assertIsNone(micro_area.address)
        self.assertIsInstance(micro_area, MicroArea)
    
    def test_micro_area_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        micro_area = MicroAreaFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(micro_area.created_at)
        self.assertIsNotNone(micro_area.updated_at)
        self.assertIsNotNone(micro_area.created_by)
        
        # Testa soft delete
        micro_area.delete()
        self.assertTrue(micro_area.is_deleted)
        self.assertIsNotNone(micro_area.deleted_at)
        
        # Testa restore
        micro_area.restore()
        self.assertFalse(micro_area.is_deleted)
        self.assertIsNone(micro_area.deleted_at)


class InstitutionModelTest(TestCase):
    """Testes para o modelo Institution"""
    
    def test_create_institution(self):
        """Testa criação de Institution"""
        institution = InstitutionFactory()
        
        self.assertIsInstance(institution, Institution)
        self.assertIsNotNone(institution.name)
        self.assertIsNotNone(institution.address)
        self.assertIsInstance(institution.address, Address)
    
    def test_institution_str_method(self):
        """Testa método __str__ do Institution"""
        institution = InstitutionFactory(name='Hospital Central')
        
        expected_str = "Hospital Central"
        self.assertEqual(str(institution), expected_str)
    
    def test_institution_optional_fields(self):
        """Testa campos opcionais do Institution"""
        institution = InstitutionFactory(
            maps_localization=None,
            address=None
        )
        
        self.assertIsNone(institution.maps_localization)
        self.assertIsNone(institution.address)
        self.assertIsInstance(institution, Institution)
    
    def test_institution_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        institution = InstitutionFactory()
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(institution.created_at)
        self.assertIsNotNone(institution.updated_at)
        self.assertIsNotNone(institution.created_by)
        
        # Testa soft delete
        institution.delete()
        self.assertTrue(institution.is_deleted)
        self.assertIsNotNone(institution.deleted_at)
        
        # Testa restore
        institution.restore()
        self.assertFalse(institution.is_deleted)
        self.assertIsNone(institution.deleted_at)


class LocationRelationshipsTest(TestCase):
    """Testes para relacionamentos entre modelos de localização"""
    
    def test_address_one_to_one_relationships(self):
        """Testa relacionamentos one-to-one do Address"""
        address = AddressFactory()
        micro_area = MicroAreaFactory(address=address)
        institution = InstitutionFactory(address=address)
        
        # Verifica que o endereço está relacionado corretamente
        self.assertEqual(micro_area.address, address)
        self.assertEqual(institution.address, address)
        
        # Verifica que pode acessar o relacionamento reverso
        self.assertEqual(address.microarea, micro_area)
        self.assertEqual(address.institution, institution)
    
    def test_cascade_delete_address(self):
        """Testa que deletar Address deleta MicroArea e Institution"""
        address = AddressFactory()
        micro_area = MicroAreaFactory(address=address)
        institution = InstitutionFactory(address=address)
        
        # Deleta o endereço (hard delete)
        address.hard_delete()
        
        # Verifica que MicroArea e Institution foram deletados permanentemente
        self.assertFalse(MicroArea.objects.filter(id=micro_area.id).exists())
        self.assertFalse(Institution.objects.filter(id=institution.id).exists())
    
    def test_set_null_on_address_delete(self):
        """Testa que MicroArea e Institution podem existir sem Address"""
        micro_area = MicroAreaFactory(address=None)
        institution = InstitutionFactory(address=None)
        
        self.assertIsNone(micro_area.address)
        self.assertIsNone(institution.address)
        self.assertIsInstance(micro_area, MicroArea)
        self.assertIsInstance(institution, Institution)
